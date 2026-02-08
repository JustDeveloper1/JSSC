import resolve from '@rollup/plugin-node-resolve'

export default {
    input: 'src/index.js',
    plugins: [resolve()],
    output: [
        {
            file: 'dist/jssc.mjs',
            format: 'es'
        },
        {
            file: 'dist/jssc.cjs',
            format: 'cjs',
            exports: 'named'
        },
        {
            file: 'dist/jssc.js',
            format: 'umd',
            name: 'JSSC'
        }
    ]
}
