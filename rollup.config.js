import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

import { name__ } from './lib/meta.js';

export default [
    {
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
    },
    {
        input: 'src/worker.js',
        plugins: [
            resolve({ preferBuiltins: true }),
            json(),
            commonjs()
        ],
        output: {
            file: 'dist/worker.js',
            format: 'es',
            inlineDynamicImports: true
        },
        external: [
            'justc',
            'node:worker_threads'
        ]
    },
    {
        input: 'bin/index.js',
        plugins: [
            resolve({
                preferBuiltins: true,
                exportConditions: ['node']
            }),
            json(),
            commonjs()
        ],
        output: {
            file: 'dist/cli.js',
            format: 'es'
        },
        external: [
            'justc',
            'fs',
            'path',
            'url',
            'child_process',
            'os',
            'https'
        ]
    },
    {
        input: 'bin/windows/install.js',
        plugins: [
            resolve({
                preferBuiltins: true,
                exportConditions: ['node']
            }),
            json(),
            commonjs()
        ],
        output: {
            file: 'dist/windows/install.js',
            format: 'es'
        },
        external: [
            'justc',
            'fs',
            'path',
            'url',
            'child_process',
            'os',
            'https'
        ]
    },
    {
        input: 'bin/windows/uninstall.js',
        plugins: [
            resolve({
                preferBuiltins: true,
                exportConditions: ['node']
            }),
            json(),
            commonjs()
        ],
        output: {
            file: 'dist/windows/uninstall.js',
            format: 'es'
        },
        external: [
            'justc',
            'fs',
            'path',
            'url',
            'child_process',
            'os',
            'https'
        ]
    }
]
