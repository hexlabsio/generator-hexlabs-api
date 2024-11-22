import { TableClient, Crud } from '@hexlabs/dynamo-ts';
import * as tables from '../tables';

export default class <%= capitalize(name) %>Service extends Crud<typeof tables.<%= name %>Table> {
  constructor(
    private readonly <%= name %>Table: TableClient<typeof tables.<%= name %>Table>,
  ) {
  super(<%= name %>Table)
}
}
