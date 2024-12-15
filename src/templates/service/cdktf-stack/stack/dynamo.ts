import { DynamodbTable, DynamodbTableConfig } from '@cdktf/provider-aws/lib/dynamodb-table';
import { TableDefinition } from '@hexlabs/dynamo-ts';
import { Construct } from 'constructs';
import * as tables from '../src/tables'
import { Variables } from './variables';

export type DynamoTables = { [K in keyof typeof tables]: DynamodbTable }
export type TableNameProps = { [K in keyof typeof tables]: string }

export function asTableConfig(table: TableDefinition): Partial<DynamodbTableConfig> {
  const cloudformation = table.asCloudFormation("_");
  const hash = cloudformation.KeySchema.find(it => it.KeyType == 'HASH');
  const range = cloudformation.KeySchema.find(it => it.KeyType == 'RANGE');
  return {
    hashKey: hash.AttributeName,
    rangeKey: range.AttributeName,
    attribute: cloudformation.KeySchema.map(it => ({
      name: it.AttributeName,
      type: "S"
    }))
  }
}

export function createTables(scope: Construct, variables: Variables, names: TableNameProps): DynamoTables {
  return Object.keys(tables).reduce((prev, table) => (
    {...prev, [table]: new DynamodbTable(scope, `dynamo-${table}`, {
      ...asTableConfig(tables[table]),
        name: `${variables.namespace}-${variables.name}-${variables.environment}-${names[table]}`,
        billingMode: 'PAY_PER_REQUEST'
      })
    }
  ), {} as DynamoTables)
}
