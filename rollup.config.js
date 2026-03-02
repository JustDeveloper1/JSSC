import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

import { name__ } from './lib/meta.js';

export default {
    input: 'src/index.js',
    plugins: [
        resolve(),
        json(),
        commonjs()
    ],
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
            name: name__,
            globals: {
                justc: "JUSTC"
            }
        }
    ],
    external: [
        'justc'
    ]
}
