import { EnvironmentBuilder } from '@hexlabs/env-vars-ts';
<% if(deployment == 'cfts') { %>import { Value } from '@hexlabs/cloudformation-ts';<% } %>

const environmentBuilder = EnvironmentBuilder.create(
  'HOST',
  'ALLOWED_ORIGIN',
  'TABLES_<%= name.toUpperCase() %>',
);

<% if(deployment == 'cfts') { %>export type ApiEnvironment = {
  [K in keyof ReturnType<typeof environmentBuilder.environment>]: Value<string>;
};<% } %>
<% if(deployment == 'cdktf') { %>export type ApiEnvironment = ReturnType<typeof environmentBuilder.environment>;<% } %>

export const apiEnv = () => environmentBuilder.environment();
<% if(type === 'user') { %>
const triggerEnvironmentBuilder = EnvironmentBuilder.create();
<% if(deployment == 'cdktf') { %>
export type TriggerEnvironment = ReturnType<typeof triggerEnvironmentBuilder.environment>;<% } %>
  <% if(deployment == 'cfts') { %>
export type TriggerEnvironment = {
  [K in keyof ReturnType<
    typeof triggerEnvironmentBuilder.environment
  >]: Value<string>;
};<% } %>

export const triggerEnv = () => triggerEnvironmentBuilder.environment();<% } %>
