import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { TableClient } from '@hexlabs/dynamo-ts';
import Api from './api';
import { apiEnv } from './environment';
import <%= capitalize(name) %>Service from './service';
import * as tables from './tables';
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
