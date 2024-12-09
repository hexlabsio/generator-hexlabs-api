import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { TableClient } from '@hexlabs/dynamo-ts';
import Api from './api';
import { apiEnv<% if(type === 'user') { %>, triggerEnv<% } %> } from './environment';
import <%= capitalize(name) %>Service from './service';
import * as tables from './tables';<% if(type === 'user') { %>
import { Triggers } from './triggers';<% } %>

class ApiRuntime {
  private constructor(
    public readonly api: Api,
    public readonly environment: ReturnType<typeof apiEnv>,
  ) {}

  static client = DynamoDBDocument.from(new DynamoDB());
  static initialise(): ApiRuntime {
    const env = apiEnv();
    const <%= name %>Table =  TableClient.build(tables.<%= name %>Table, {
      client: ApiRuntime.client,
      tableName: env.TABLES_<%= name.toUpperCase() %>,
    });
    const service = new <%= capitalize(name) %>Service(<%= name %>Table);
    const api = new Api(service);
    return new ApiRuntime(api, env);
  }
}
export const apiRuntime = () => ApiRuntime.initialise();
<% if(type === 'user') { %>
class TriggerRuntime {
  private constructor(
    public readonly triggers: Triggers,
    public readonly environment: ReturnType<typeof triggerEnv>,
  ) {}

  static client = DynamoDBDocument.from(new DynamoDB());
  static initialise(): TriggerRuntime {
    const env = triggerEnv();
    const triggers = new Triggers();
    return new TriggerRuntime(triggers, env);
  }
}
export const triggerRuntime = () => TriggerRuntime.initialise();<% } %>
