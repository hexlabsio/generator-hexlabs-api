import {
 <%= naming.apiClass %>, <%= naming.apiClass %>Handlers,
} from '../../generated/<%= namespace %>-<%= name %>-api/api';
import <%= capitalize(name) %>Service from '../service';
import { authorized } from '../claims'

export default class Api extends <%= naming.apiClass %> {
  constructor(private readonly <%= name %>Service: <%= capitalize(name) %>Service) {
    super();
  }

  handlers: Partial<<%= naming.apiClass %>Handlers> = {
    get<%= capitalize(name) %>: authorized(claims => async (request) => {
      this.logger.info('Get <%= capitalize(name) %>')
      return {
        statusCode: 200,
        body: JSON.stringify({"hello": "world"})
      }
    })
  };
}
