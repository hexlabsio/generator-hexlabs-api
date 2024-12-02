import { LambdaFunction, LambdaFunctionEnvironment } from '@cdktf/provider-aws/lib/lambda-function';
import { Construct } from 'constructs';
import { ApiEnvironment } from '../src/environment';
import { DynamoTables } from './dynamo';
import { apiLambdaRole } from './iam';
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

export function apiLambda(scope: Construct, sha: string, s3Bucket: string, s3Key: string, variables: Variables, tables: DynamoTables): LambdaFunction {
  const role = apiLambdaRole(scope, Object.values(tables));
  return new LambdaFunction(scope, "api-lambda-function", {
    sourceCodeHash: sha,
    functionName: `${variables.namespace}-${variables.name}-service-api-${variables.environment}`,
    timeout: 30,
    memorySize: 2048,
    architectures: ['arm64'],
    s3Bucket,
    s3Key,
    role: role.arn,
    handler: 'index.handler',
    runtime: 'nodejs20.x',
    environment: lambdaVariables<ApiEnvironment>({ HOST: variables.host, ALLOWED_ORIGIN: variables.allowed_origins, TABLES_<%= name.toUpperCase() %>: tables.<%= name %>Table.name }),
  });
}
