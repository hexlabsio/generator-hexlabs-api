import { EnvironmentBuilder } from '@hexlabs/env-vars-ts';
import { Value } from '@hexlabs/cloudformation-ts';

const environmentBuilder = EnvironmentBuilder.create(
  'HOST',
  'ALLOWED_ORIGIN',
  'TABLES_<%= name.toUpperCase() %>',
);

export type ApiEnvironment = {
  [K in keyof ReturnType<typeof environmentBuilder.environment>]: Value<string>;
};

export const apiEnv = () => environmentBuilder.environment();
