import middy from '@middy/core';
import { apiRuntime<% if(type === 'user') { %>,triggerRuntime<% } %> } from './runtime';
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import httpRouterHandler from '@middy/http-router'<% if(type === 'user') { %>
import { CognitoUserPoolTriggerEvent } from 'aws-lambda';
<% } %>

function apiHandler() {
  const runtime = apiRuntime();
  return middy()
    .use(httpErrorHandler())
    .use(httpHeaderNormalizer())
    .use(cors({ credentials: true, origins: [runtime.environment.ALLOWED_ORIGIN] }))
    .handler(httpRouterHandler(runtime.api.routes()))
}

export function handler(...args: any) {
  return apiHandler()(...args);
}

<% if(type === 'user') { %>
export async function triggerHandler(event: CognitoUserPoolTriggerEvent) {
  return triggerRuntime().triggers.handle(event);
}
<% } %>
