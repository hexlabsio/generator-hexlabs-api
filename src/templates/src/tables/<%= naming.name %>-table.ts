import { TableDefinition } from '@hexlabs/dynamo-ts';

export type <%= capitalize(naming.name) %>Table = {
  id: string;
  sort: string;
}

export const <%= naming.name %>Table = TableDefinition.ofType<<%= capitalize(naming.name) %>Table>()
  .withPartitionKey('id')
  .withSortKey('sort');
