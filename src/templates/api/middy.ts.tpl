import {
 <%= naming.apiClass %>, <%= naming.apiClass %>Handlers,
} from '../../generated/hexlabs-account-api/api';
import <%= capitalize(name) %>Service from '../service';

export default class Api extends <%= naming.apiClass %> {
  constructor(private readonly <%= name %>ervice: <%= capitalize(name) %>Service) {
    super();
  }

  handlers: Partial<<%= naming.apiClass %>Handlers> = {
    get<%= capitalize(name) %>: async (request) => {
      console.log('Get <%= name %>');
      // const account = await this.<%= name %>Service.read({ id: 'test', sort: 'test' });
      return {
        statusCode: 200,
        body: JSON.stringify({"hello": "world"})
      }
    }
  };
}
