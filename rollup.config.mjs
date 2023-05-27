import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import * as path from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const PACKAGE_JSON_IN = readFileSync('shared/package.json.in', {encoding: 'utf-8'})
const NAMESPACES = [
    'operators',
    'utils'
]

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
            '',
            ...NAMESPACES
        ]),
        external: ['async-option', 'rxjs']
    }
}
function insertVariable(content, variableName, value) {
    console.log(content)

    return content.replaceAll(`<(${variableName})`, value)
}
function createNamespace(namespacePath) {
    let package_json = PACKAGE_JSON_IN
    const variables = {
        NSPATH: namespacePath,
        PKGNAME: 'async-reader',
        INSTALLDIR: Array.from(namespacePath.split('/'), () => '..').join('/')
    }

    for (const variableName in variables)
        package_json = insertVariable(package_json, variableName, variables[variableName])

    mkdirSync(namespacePath, {recursive: true})
    writeFileSync(`${namespacePath}/package.json`, package_json, {encoding: 'utf-8'})
}

NAMESPACES.forEach(createNamespace)

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
