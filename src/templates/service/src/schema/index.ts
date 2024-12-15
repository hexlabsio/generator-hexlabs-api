import { OpenApiSpecificationBuilder, ZodSchemaBuilder } from '@hexlabs/schema-api-ts';
import * as model from './model';
import servers from './servers';

const schemas = ZodSchemaBuilder.create()
  .add("<%= capitalize(name) %>", model.<%= capitalize(name) %>)
  .build()

export default OpenApiSpecificationBuilder.create(schemas, {
  title: '<%= capitalize(namespace) %> <%= capitalize(name) %> Api',
  version: '1.0.0',
})
  .add('servers', () => servers)
  .addComponent('responses', (o) => ({
    Forbidden: o.response(o.textContent('Forbidden'), 'Access Denied'),
    Unauthorized: o.response(o.textContent('Unauthorized'), 'Unauthorized'),
    BadRequest: o.response(
      { 'application/json': { schema: { type: 'object' } } },
      'Bad Request',
    ),
  }))
  .defaultResponses((o) => ({
    '400': o.responseReference('BadRequest'),
    '401': o.responseReference('Unauthorized'),
    '403': o.responseReference('Forbidden'),
  }))
  .withAWSCognitoSecurityScheme('cognitoScheme', '${cognitoPoolEndpoint}', '${cognitoAppClientId}')
  .withAWSLambdaApiGatewayIntegration('apiLambda', '${functions.handler}')
  .withPath('<%= name %>', (path, oas) =>
    path.resource('<%= name %>Id', path =>
      path.get('get<%= capitalize(name) %>', {
        'x-amazon-apigateway-integration': oas.awsLambdaApiGatewayIntegration.apiLambda,
        security: [oas.securitySchemes.cognitoScheme()],
        responses: {
          200: oas.jsonResponse('<%= capitalize(name) %>', 'One <%= capitalize(name) %>')
        }
      })
    )
  )
  .build();
