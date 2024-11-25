import { LambdaExpects, Value } from '@hexlabs/cloudformation-ts';
import { CodeProps } from '@hexlabs/cloudformation-ts/dist/aws/lambda/function/CodeProps';
import { EnvironmentProps } from '@hexlabs/cloudformation-ts/dist/aws/lambda/function/EnvironmentProps';

import { Lambda } from '@hexlabs/cloudformation-ts/dist/cloudformation/modules/lambda';
import { ApiEnvironment } from '../../src/environment';
import { name } from './environment';
import { DynamoTables } from './tables';

function lambdaVariables<T>(variables: T): EnvironmentProps {
  return {
    variables: {
      ...variables,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps'
    }
  };
}


export function createApiLambda(aws: LambdaExpects, code: CodeProps, host: Value<string>, allowedOrigins: Value<string>, tables: DynamoTables): Lambda {
  return Lambda.create(aws, name('api'), code, 'index.handler', 'nodejs20.x', {
    timeout: 30,
    memorySize: 2048,
    architectures: ['arm64'],
    environment: lambdaVariables<ApiEnvironment>({ HOST: host, ALLOWED_ORIGIN: allowedOrigins, TABLES_<%= name.toUpperCase() %>: tables.<%= name %>Table }),
  })
}
