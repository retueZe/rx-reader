import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import * as path from 'node:path'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'

const EXTERNAL = [
    'rxjs',
    'async-option',
    'async-option/async',
    'async-option/utils/option'
]
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
        input: createInput(['', ...NAMESPACES]),
        external: EXTERNAL
    }
}
function buildPackageJson() {
    const packageJson = JSON.parse(readFileSync('package.json'))
    delete packageJson.private
    packageJson.types = 'index.d.ts'
    packageJson.module = 'index.js'
    packageJson.exports = {
        '.': {
            types: './index.d.ts',
            import: './index.js'
        },
        './package.json': './package.json'
    }
    delete packageJson.scripts
    delete packageJson.devDependencies

    for (const namespace of NAMESPACES) {
        packageJson.exports[`./${namespace}`] = {
            types: `./${namespace}/index.d.ts`,
            import: `./${namespace}/index.js`
        }
    }

    if (!existsSync('build')) mkdirSync('build')

    writeFileSync('build/package.json', JSON.stringify(packageJson), 'utf-8')
}
function buildMarkdown() {
    for (const file of readdirSync('.')) {
        if (path.extname(file) !== '.md') continue

        copyFileSync(file, `build/${file}`)
    }
}

buildPackageJson()
buildMarkdown()

/** @type {import('rollup').RollupOptions[]} */
const config = [
    {
        output: {
            dir: 'build',
            entryFileNames: createEntryFileNames(),
            chunkFileNames: '.chunks/[name]-[hash].js',
            format: 'esm'
        },
        plugins: [
            typescript(),
            terser({
                ecma: 2020,
                module: true,
                keep_classnames: true,
                keep_fnames: true
            })
        ]
    },
    {
        output: {
            dir: 'build',
            entryFileNames: createEntryFileNames('.d.ts'),
            chunkFileNames: '.chunks/[name]-[hash].d.ts',
            format: 'esm'
        },
        plugins: [dts()]
    }
]
export default config.map(applyDefaultConfig)
