import { CloudfrontDistribution } from '@cdktf/provider-aws/lib/cloudfront-distribution';
import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { DataAwsRoute53Zone } from '@cdktf/provider-aws/lib/data-aws-route53-zone';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket';
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy';
import { S3BucketPublicAccessBlock } from '@cdktf/provider-aws/lib/s3-bucket-public-access-block';
import { S3BucketWebsiteConfiguration } from '@cdktf/provider-aws/lib/s3-bucket-website-configuration';
import { Construct } from 'constructs';
import { Variables } from './variables';

export function distribution(scope: Construct, vars: Variables, website: S3BucketWebsiteConfiguration, edgeLambdaArn: string, certificateArn: string) {
  return new CloudfrontDistribution(scope, 'distribution', {
    aliases: [vars.domain, 'www.' + vars.domain],
    dependsOn: [website],
    customErrorResponse: [{
      errorCode: 404, responseCode: 200, responsePagePath: '/'
    }],
    restrictions: { geoRestriction: {restrictionType: 'none', locations: []}},
    defaultCacheBehavior: {
      cachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
      compress: false,
      lambdaFunctionAssociation: [{
        eventType: 'viewer-request',
        lambdaArn: edgeLambdaArn
      }],
      responseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03',
      targetOriginId: `${vars.namespace}-${vars.name}`,
      viewerProtocolPolicy: 'redirect-to-https',
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD"]
    },
    defaultRootObject: 'index.html',
    enabled: true,
    httpVersion: 'http2',
    isIpv6Enabled: true,
    origin: [
      {
        originId: `${vars.namespace}-${vars.name}`,
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: 'http-only',
          originSslProtocols: [ 'TLSv1.2' ],
        },
        domainName: `${vars.namespace}-${vars.name}-${vars.environment}.s3-website-eu-west-1.amazonaws.com`,
      }
    ],
    viewerCertificate: {
      acmCertificateArn: certificateArn,
      minimumProtocolVersion: 'TLSv1.2_2021',
      sslSupportMethod: 'sni-only'
    }
  })
}

export function createWebsite(scope: Construct, vars: Variables, edgeLambdaArn: string, certificateArn: string) {
  const bucket = new S3Bucket(scope, 'website-bucket', {
    bucket: `${vars.namespace}-${vars.name}-${vars.environment}`,
  });

  const website = new S3BucketWebsiteConfiguration(scope, 'webstie-config', {
    bucket: bucket.bucket,
    indexDocument: { suffix: 'index.html' },
    errorDocument: { key: 'index.html' },
  });

  const publicAccess = new S3BucketPublicAccessBlock(scope, 'website-access', {
    bucket: bucket.bucket,
    blockPublicPolicy: false,
    restrictPublicBuckets: false
  });

  const policy = new DataAwsIamPolicyDocument(scope, 'website-policy', {
    statement: [
      {
        sid: "AllowPublicRead",
        effect: "Allow",
        resources: [
          bucket.arn,
          `${bucket.arn}/*`,
        ],
        actions: ["S3:GetObject"],
        principals: [{
          type: '*',
          identifiers: ['*']
        }]
      }
    ],
    dependsOn: [publicAccess]
  });

  new S3BucketPolicy(scope, 'bucket-policy', {
    bucket: bucket.bucket,
    policy: policy.json
  });

  const dist = distribution(scope, vars, website, edgeLambdaArn, certificateArn);

  const hostedZone = new DataAwsRoute53Zone(scope, 'hosted-zone', {
    name: vars.domain
  });
  new Route53Record(scope, 'web-record', {
    name: vars.domain,
    type: 'A',
    zoneId: hostedZone.zoneId,
    alias: {
      evaluateTargetHealth: false,
      name: dist.domainName,
      zoneId: 'Z2FDTNDATAQYW2'
    }
  });
  new Route53Record(scope, 'web-www-record', {
    name: 'www.' + vars.domain,
    type: 'A',
    zoneId: hostedZone.zoneId,
    alias: {
      evaluateTargetHealth: false,
      name: dist.domainName,
      zoneId: 'Z2FDTNDATAQYW2'
    }
  });
}
