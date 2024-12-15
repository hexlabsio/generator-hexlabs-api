import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { LambdaFunction, LambdaFunctionEnvironment } from '@cdktf/provider-aws/lib/lambda-function';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Construct } from 'constructs';
import { Variables } from './variables';

function lambdaVariables<T>(variables: T): LambdaFunctionEnvironment {
  return {
    variables: {
      ...variables,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps'
    }
  };
}

export function edgeLambda(scope: Construct, provider: AwsProvider, sha: string, s3Key: string, variables: Variables, role: IamRole): LambdaFunction {
  return new LambdaFunction(scope, "edge-lambda-function", {
    provider,
    sourceCodeHash: sha,
    functionName: `${variables.namespace}-${variables.name}-edge-${variables.environment}`,
    timeout: 30,
    memorySize: 2048,
    architectures: ['arm64'],
    s3Bucket: variables.code_s3_bucket,
    s3Key,
    role: role.arn,
    handler: 'index.handler',
    runtime: 'nodejs20.x',
    environment: lambdaVariables({})
  })
}
