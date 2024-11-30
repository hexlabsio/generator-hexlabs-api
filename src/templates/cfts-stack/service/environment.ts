import { EnvironmentBuilder } from '@hexlabs/env-vars-ts';

export const environment = EnvironmentBuilder
  .create('NAMESPACE')
  .environment();

export function name(unique?: string): string {
  return `${environment.NAMESPACE}${unique ? `-${unique}` : ''}`;
}