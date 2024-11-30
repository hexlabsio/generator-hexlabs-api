import { AWSResourcesFor, Value } from '@hexlabs/cloudformation-ts';
import { Table } from '@hexlabs/cloudformation-ts/dist/aws/dynamodb/Table';
import * as tables from '../../src/tables'
import { name } from './environment';

export type DynamoTables = { [K in keyof typeof tables]: Table }
export type TableNameProps = { [K in keyof typeof tables]: Value<string> }

export function createTables(aws: AWSResourcesFor<'dynamodb'> , names: TableNameProps): DynamoTables {
  return Object.keys(tables).reduce((prev, table) => (
    {...prev, [table]: aws.dynamodb.table(tables[table].asCloudFormation(name(names[table]), {billingMode: 'PAY_PER_REQUEST'})) }
  ), {} as DynamoTables)
}
