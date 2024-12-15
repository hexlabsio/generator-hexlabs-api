import * as z from 'zod';
export const <%= capitalize(naming.name) %> = z.object({
  id: z.string(),
});
export type <%= capitalize(naming.name) %> = z.infer<typeof <%= capitalize(naming.name) %>>
