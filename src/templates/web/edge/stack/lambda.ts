import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Construct } from 'constructs';
import { Variables } from './variables';

export function edgeLambda(scope: Construct, provider: AwsProvider, sha: string, s3Key: string, variables: Variables, role: IamRole): LambdaFunction {
  return new LambdaFunction(scope, "edge-lambda-function", {
    provider,
    sourceCodeHash: sha,
    functionName: `${variables.namespace}-${variables.name}-${variables.environment}`,
    timeout: 5,
    memorySize: 128,
    architectures: ['x86_64'],
    s3Bucket: variables.code_s3_bucket,
    s3Key,
    role: role.arn,
    handler: 'index.handler',
    runtime: 'nodejs20.x',
    publish: true
  });
}
