import { AcmCertificate } from '@cdktf/provider-aws/lib/acm-certificate';
import { AcmCertificateValidation } from '@cdktf/provider-aws/lib/acm-certificate-validation';
import { CognitoIdentityProvider } from '@cdktf/provider-aws/lib/cognito-identity-provider';
import { CognitoUserGroup } from '@cdktf/provider-aws/lib/cognito-user-group';
import { CognitoUserPool } from '@cdktf/provider-aws/lib/cognito-user-pool';
import { CognitoUserPoolClient } from '@cdktf/provider-aws/lib/cognito-user-pool-client';
import { CognitoUserPoolDomain } from '@cdktf/provider-aws/lib/cognito-user-pool-domain';
import { DataAwsRoute53Zone } from '@cdktf/provider-aws/lib/data-aws-route53-zone';
import { LambdaPermission } from '@cdktf/provider-aws/lib/lambda-permission';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { Construct } from 'constructs';
import { Variables } from './variables';
import { conditional, Op, Fn } from 'cdktf';

function googleProvider(scope: Construct, userPoolId: string, variables: Variables): CognitoIdentityProvider {

  return new CognitoIdentityProvider(scope, 'google-provider', {
    providerName: 'Google',
    providerType: 'Google',
    userPoolId,
    providerDetails: {
      client_id: variables.google_client_id,
      client_secret: variables.google_client_secret,
      authorize_scopes: 'profile email openid',
      attributes_url: "https://people.googleapis.com/v1/people/me?personFields=",
      attributes_url_add_attributes: "true",
      authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
      oidc_issuer: "https://accounts.google.com",
      token_request_method: "POST",
      token_url: "https://www.googleapis.com/oauth2/v4/token"
    },
    attributeMapping: {
      username: 'sub',
      email: 'email'
    }
  })
}

export function userPool(scope: Construct, variables: Variables, triggers: string) {
  return new CognitoUserPool(scope, 'user-pool', {
    name: `<%= namespace %>-users-${variables.environment}`,
    adminCreateUserConfig: { allowAdminCreateUserOnly: false },
    aliasAttributes: ['email'],
    passwordPolicy: {
      minimumLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true
    },
    autoVerifiedAttributes: ['email'],
    emailConfiguration: {
      emailSendingAccount: 'COGNITO_DEFAULT',
      replyToEmailAddress: 'admin@hexlabs.io'
    },
    schema: [{
      attributeDataType: 'String', mutable: true, name: 'email', required: true, stringAttributeConstraints: {
        minLength: '3',
        maxLength: '2048'
      }
    }],
    lambdaConfig: {
      preSignUp: triggers,
      userMigration: triggers,
      createAuthChallenge: triggers,
      customMessage: triggers,
      postAuthentication: triggers,
      postConfirmation: triggers,
      defineAuthChallenge: triggers,
      preAuthentication: triggers,
      preTokenGeneration: triggers,
      verifyAuthChallengeResponse: triggers,
    }
  })
}

function authCertificate(scope: Construct, usEast1Provider: AwsProvider, domain: string): AcmCertificateValidation {
  const certificate =  new AcmCertificate(scope, "auth-certificate", {
    provider: usEast1Provider,
    domainName: ['login', 'auth', domain].join('.'),
    subjectAlternativeNames: [domain],
    validationOption: [{domainName: domain, validationDomain: domain}],
    validationMethod: 'DNS'
  });
  return new AcmCertificateValidation(scope, "auth-certificate-validation", {
    provider: usEast1Provider,
    certificateArn: certificate.arn
  })
}

export function createUserPool(
  scope: Construct, usEast1Provider: AwsProvider, variables: Variables, triggers: string
): { pool: CognitoUserPool, client: CognitoUserPoolClient } {
  const authCert = authCertificate(scope, usEast1Provider, variables.domain);
  const pool = userPool(scope, variables, triggers);

  new LambdaPermission(scope, 'triggers-permission', {
    functionName: triggers,
    action: 'lambda:InvokeFunction',
    principal: 'cognito-idp.amazonaws.com',
    sourceArn: pool.arn
  });

  new CognitoUserGroup(scope, 'user-group', {
    userPoolId: pool.id,
    name: 'administrators',
    description: 'Administrators'
  });

  new CognitoUserPoolDomain(scope, 'user-domain', {
    userPoolId: pool.id,
    domain: conditional(Op.eq(variables.domain_prefix, Fn.rawString("")), "<%= namespace %>-users", `<%= namespace %>-users-${variables.domain_prefix}`).toString(),
  });

  const customDomain = new CognitoUserPoolDomain(scope, 'user-custom-domain', {
    userPoolId: pool.id,
    domain: `login.auth.${variables.domain}`,
    certificateArn: authCert.certificateArn
  });

 const hostedZone = new DataAwsRoute53Zone(scope, 'hosted-zone', {
   name: variables.domain
 });
 new Route53Record(scope, 'auth-record', {
   name: customDomain.domain,
   type: 'A',
   zoneId: hostedZone.zoneId,
   alias: {
     evaluateTargetHealth: false,
     name: customDomain.cloudfrontDistribution,
     zoneId: customDomain.cloudfrontDistributionZoneId
   }
 });

  const google = googleProvider(scope, pool.id, variables);
  const client = new CognitoUserPoolClient(scope, 'app-client', {
    supportedIdentityProviders: [google.providerName, 'COGNITO'],
    userPoolId: pool.id,
    name: '<%= namespace %>-external-client',
    allowedOauthFlowsUserPoolClient: true,
    allowedOauthFlows: ['code'],
    allowedOauthScopes: ['email', 'openid', 'profile'],
    callbackUrls: variables.redirect_uris
  });
  return { client, pool };
}
