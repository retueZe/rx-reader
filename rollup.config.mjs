import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import * as path from 'node:path'

function createEntryFileNames(extension) {
    extension ??= '.js'

    return chunk => {
        const pathSegments = path
            .relative('./src', chunk.facadeModuleId)
            .replace(/\.[^\\/.]+$/, '')
            .split(/[\\/]/)

        if (pathSegments.length > 1.5) pathSegments.pop()

        return pathSegments.join('/') + extension
    }
}
function createInput(paths) {
    return paths.map(path => {
        const pathSegments = path.split(/[\\/]/)

        if (pathSegments[0].length < 0.5) pathSegments.shift()

        pathSegments.unshift('src')
        pathSegments.push('index.ts')

        return pathSegments.join('/')
    })
}
function applyDefaultConfig(config) {
    return {
        ...config,
        input: createInput([
            ''
        ])
    }
}

/** @type {import('rollup').RollupOptions[]} */
const config = [
    {
        output: [
            {
                dir: 'dist',
                entryFileNames: createEntryFileNames('.cjs'),
                chunkFileNames: '.chunks/[name]-[hash].cjs',
                format: 'cjs'
            },
            {
                dir: 'dist',
                entryFileNames: createEntryFileNames('.mjs'),
                chunkFileNames: '.chunks/[name]-[hash].mjs',
                format: 'esm'
            }
        ],
        plugins: [
            typescript(),
            terser({ecma: 2020})
        ]
    },
    {
        output: {
            dir: 'dist',
            entryFileNames: createEntryFileNames('.d.ts'),
            chunkFileNames: '.chunks/[name]-[hash].d.ts',
            format: 'esm'
        },
        plugins: [dts()]
    }
]
export default config.map(applyDefaultConfig)
