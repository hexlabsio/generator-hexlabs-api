import { SchemaBuilder } from '@hexlabs/schema-api-ts';

export default SchemaBuilder.create()
  .add('<%= capitalize(naming.name) %>', (s) =>
    s.object({ id: s.string() }),
  )
  .build();
