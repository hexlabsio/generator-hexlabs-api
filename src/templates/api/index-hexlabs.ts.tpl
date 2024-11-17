import { allFilters, CorsConfig, Handler } from '@hexlabs/http-api-ts';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { apiRuntime } from './runtime';

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
