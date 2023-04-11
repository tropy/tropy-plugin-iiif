import commonjs from '@rollup/plugin-commonjs'
import license from 'rollup-plugin-license'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

export default {
  input: 'src/plugin.js',
  output: {
    file: 'index.js',
    format: 'cjs',
    exports: 'default',
    generatedCode: 'es2015'
  },
  external: ['electron'],
  plugins: [
    resolve({
      exportConditions: ['node'],
      preferBuiltins: true
    }),
    json(),
    commonjs(),
    license({
      thirdParty: {
        includePrivate: true,
        output: {
          file: 'third-party-licenses.txt'
        }
      }
    })
  ]
}
