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
  .add('paths', (o) => ({
    '/{stage}/<%= name %>/{<%= name %>Id}': {
      get: {
        operationId: 'get<%= capitalize(name) %>',
        parameters: [o.path('<%= name %>Id')],
        responses: {
          200: o.response(o.jsonContent('<%= capitalize(name) %>'), 'One <%= capitalize(name) %>'),
        },
      },
    },
  }))
  .build();
