import { EnvironmentBuilder } from '@hexlabs/env-vars-ts';
<% if(deployment == 'cfts') { %>import { Value } from '@hexlabs/cloudformation-ts';<% } %>

const environmentBuilder = EnvironmentBuilder.create(
  'HOST',
  'ALLOWED_ORIGIN',
  'TABLES_<%= name.toUpperCase() %>',
);

export type ApiEnvironment = ReturnType<typeof environmentBuilder.environment>;

export const apiEnv = () => environmentBuilder.environment();
<% if(type === 'user') { %>
const triggerEnvironmentBuilder = EnvironmentBuilder.create();

export type TriggerEnvironment = ReturnType<typeof triggerEnvironmentBuilder.environment>;

export const triggerEnv = () => triggerEnvironmentBuilder.environment();<% } %>
