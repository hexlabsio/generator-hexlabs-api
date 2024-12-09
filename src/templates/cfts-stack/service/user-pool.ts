import { AWSResourcesFor, join, Lambda, Value } from '@hexlabs/cloudformation-ts';
import { UserPool } from '@hexlabs/cloudformation-ts/dist/aws/cognito/UserPool';

function userPool(aws: AWSResourcesFor<'cognito'>, environment: Value<string>, triggers: Value<string>): UserPool {
  return aws.cognito.userPool({
    userPoolName: join('<%= namespace %>-users-', environment),
    adminCreateUserConfig: { allowAdminCreateUserOnly: false },
    aliasAttributes: ['email'],
    policies: {
      passwordPolicy: {
        minimumLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true
      }
    },
    autoVerifiedAttributes: ['email'],
    emailConfiguration: {
      emailSendingAccount: 'COGNITO_DEFAULT',
      replyToEmailAddress: 'admin@hexlabs.io'
    },
    schema: [{mutable: true, name: 'email', required: true}],
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

export function createUserPool(
  aws: AWSResourcesFor<'cognito' | 'route53'>,
  triggers: Lambda,
  environment: Value<string>
): {userPool: UserPool} {
  const pool = userPool(aws, environment, triggers.lambda.attributes.Arn());
  aws.cognito.userPoolGroup({
    groupName: 'administrators',
    userPoolId: pool,
    description: 'Admin Users',
  });

  aws.cognito.userPoolDomain({
    userPoolId: pool,
    domain: aws.functions.if('IsProd', '<%= namespace %>', join('<%= namespace %>-', environment))
  })

  return { userPool: pool };
}
