import { writeJestDynamoConfig } from '@hexlabs/dynamo-ts';
import * as tables from './src/tables';

(async () => writeJestDynamoConfig(tables, 'dynamodb-tables.cjs',{port: 5500}))();
