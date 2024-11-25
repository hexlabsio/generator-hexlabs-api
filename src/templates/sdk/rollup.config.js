import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.ts',
    output: {
        dir: 'build',
        format: 'esm',
        entryFileNames: '[name].mjs',
        sourcemap: true
    },
    plugins: [
        typescript(),
        terser({
            format: {
                beautify: true,
                ecma: '2022',
            },
            compress: false,
            mangle: false,
            module: true,
        }),
    ]
};
