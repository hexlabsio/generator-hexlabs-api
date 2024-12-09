import { LambdaFunction, LambdaFunctionEnvironment } from '@cdktf/provider-aws/lib/lambda-function';
import { Construct } from 'constructs';
import { ApiEnvironment<% if(type === 'user') { %>, TriggerEnvironment<% } %> } from '../src/environment';
import { DynamoTables } from './dynamo';
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

export function apiLambda(scope: Construct, sha: string, s3Key: string, variables: Variables, role: IamRole, tables: DynamoTables): LambdaFunction {
  return new LambdaFunction(scope, "api-lambda-function", {
    sourceCodeHash: sha,
    functionName: `${variables.namespace}-${variables.name}-service-api-${variables.environment}`,
    timeout: 30,
    memorySize: 2048,
    architectures: ['arm64'],
    s3Bucket: variables.code_s3_bucket,
    s3Key,
    role: role.arn,
    handler: 'index.handler',
    runtime: 'nodejs20.x',
    environment: lambdaVariables<ApiEnvironment>({ HOST: variables.host, ALLOWED_ORIGIN: variables.allowed_origins, TABLES_<%= name.toUpperCase() %>: tables.<%= name %>Table.name }),
  })
}
<% if(type === 'user') { %>
export function triggersLambda(scope: Construct, sha: string, s3Key: string, variables: Variables, role: IamRole, tables: DynamoTables): LambdaFunction {
  return new LambdaFunction(scope, "triggers-lambda-function", {
    sourceCodeHash: sha,
    functionName: `${variables.namespace}-${variables.name}-service-triggers-${variables.environment}`,
    timeout: 30,
    memorySize: 2048,
    architectures: ['arm64'],
    s3Bucket: variables.code_s3_bucket,
    s3Key,
    role: role.arn,
    handler: 'index.triggerHandler',
    runtime: 'nodejs20.x',
    environment: lambdaVariables<TriggerEnvironment>({ HOST: variables.host, ALLOWED_ORIGIN: variables.allowed_origins }),
  })
}<% } %>
