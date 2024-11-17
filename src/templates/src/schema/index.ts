import { OpenApiSpecificationBuilder } from '@hexlabs/schema-api-ts';
import schemas from './model';
import servers from './servers';

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
    '/<%= naming.name %>/{<%= naming.name %>Id}': {
      get: {
        operationId: 'get<%= capitalize(naming.name) %>',
        parameters: [o.path('<%= naming.name %>Id')],
        responses: {
          200: o.response(o.jsonContent('<%= capitalize(naming.name) %>'), 'One <%= capitalize(naming.name) %>'),
        },
      },
    },
  }))
  .build();
