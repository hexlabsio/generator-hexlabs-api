import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: 'esm',
    sourcemap: true,
    file: 'build/index.mjs',
  },
  external: ['aws-sdk', /@aws-sdk\/.*/],
  plugins: [
    json({ compact: true }),
    commonjs(),
    resolve({ preferBuiltins: true, exportConditions: ['node'] }),
    typescript({ sourceMap: true }),
  ],
});
