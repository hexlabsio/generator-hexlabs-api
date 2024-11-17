import middy from '@middy/core';
import { apiRuntime } from './runtime';
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import httpRouterHandler, { Route } from '@middy/http-router'

function apiHandler() {
  const runtime = apiRuntime();
  return middy()
    .use(httpErrorHandler())
    .use(httpHeaderNormalizer())
    .use(cors({ credentials: true, origins: [runtime.environment.ALLOWED_ORIGIN] }))
    .handler(httpRouterHandler(runtime.api.routes()))
}

export const handler = apiHandler();

