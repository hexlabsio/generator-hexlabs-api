import {
  <%= naming.apiClass %>, <%= naming.apiClass %>Handlers,
} from '../../generated/<%= namespace %>-<%= name %>-api/api';
import <%= capitalize(name) %>Service from '../service';
import { authorized } from '../claims'

export default class Api extends <%= naming.apiClass %> {
  constructor(host: string, private readonly <%= name %>Service: <%= capitalize(name) %>Service) {
    super(host, '/');
  }

  handlers: Partial<<%= naming.apiClass %>Handlers> = {
    get<%= capitalize(name) %>: authorized(claims => async (request, { path: { <%= name %>Id } }, respondWith) => {
          console.log('Get <%= capitalize(name) %>', { <%= name %>Id });
          const <%= name %> = await this.<%= name %>Service.read({ id: <%= name %>Id, sort: 'test' });
          return respondWith['200'].json(<%= name %>);
        })
  };
}
