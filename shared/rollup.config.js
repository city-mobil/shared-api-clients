import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: false,
  },
  plugins: [resolve(), commonjs(), typescript(), copy({
    targets: [
      { src: 'src/templates/**/*', dest: 'dist/templates' }
    ]
  })],
  external: [...Object.keys(pkg.peerDependencies)],
}
