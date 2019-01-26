const path = require('path')
const camelize = require('camelize')

const buble = require('rollup-plugin-buble')
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')

const packageJson = require('../package.json')
const version = process.env.VERSION || packageJson.version

const {
  name,
  author,
  description
} = packageJson
const banner =
  `/*!
  * ${name} v${version}
  * (c) ${new Date().getFullYear()} ${author}
  * @description ${description}
  * @license MIT
  */`

const resolve = _path => path.resolve(__dirname, '../', _path)

module.exports = [
  // browser dev
  {
    file: resolve(`dist/${name}.js`),
    format: 'umd',
    env: 'development'
  },
  {
    file: resolve(`dist/${name}.min.js`),
    format: 'umd',
    env: 'production'
  },
  {
    file: resolve(`dist/${name}.common.js`),
    format: 'cjs'
  },
  {
    file: resolve(`dist/${name}.esm.js`),
    format: 'es'
  }
].map(genConfig)

function genConfig (opts) {
  const config = {
    input: {
      input: resolve('src/index.js'),
      plugins: [
        node(),
        cjs(),
        replace({
          __VERSION__: version
        }),
        buble()
      ]
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      name: camelize(name)
    }
  }

  if (opts.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  return config
}