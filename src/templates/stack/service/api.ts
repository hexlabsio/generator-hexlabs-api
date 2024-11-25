import { Api, ApiExpects, AWSResourcesFor, join, Lambda, Value } from '@hexlabs/cloudformation-ts';
import apiPaths from '../../generated/<%= namespace %>-<%= name %>-api/paths.json' assert { type: 'json' };
import { name } from './environment';

export function createApi(aws: ApiExpects & AWSResourcesFor<'route53'>, stage: Value<string>, zoneId: Value<string>, domainName: Value<string>, certificateArn: Value<string>, lambda: Lambda, userPooArn?: Value<string>): Api {
  const apiDomain = join('<%= name %>.api.', domainName);
  return Api
    .create(aws, name(), stage as any, lambda.lambda.attributes.Arn())
    .withCognitoAuthorizer(userPooArn, "COGNITO_USER_POOLS")
    .mapToARecord(certificateArn, zoneId, apiDomain)
    .apiFrom(apiPaths)
}
