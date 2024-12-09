import { allFilters, CorsConfig, Handler } from '@hexlabs/http-api-ts';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult<% if(type === 'user') { %>,
  CognitoUserPoolTriggerEvent<% } %>
} from 'aws-lambda';
import { apiRuntime<% if(type === 'user') { %>,triggerRuntime<% } %> } from './runtime';

export const handler: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  const environmentRuntime = apiRuntime();
  const corsConfig: CorsConfig = {
    origins: [environmentRuntime.environment.ALLOWED_ORIGIN],
    methods: '*',
    headers: '*',
  };
  return allFilters(
    environmentRuntime.api.version,
    corsConfig,
  )(environmentRuntime.api.routes())(event);
};
<% if(type === 'user') { %>
export async function triggerHandler(event: CognitoUserPoolTriggerEvent) {
  return triggerRuntime().triggers.handle(event);
}
<% } %>
