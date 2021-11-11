#!/usr/bin/env node
const _ = require('lodash');
const { generateApi } = require('swagger-typescript-api');
const path = require('path');
const yargs = require('yargs');

const PROJECT = (yargs.argv.project && yargs.argv.project !== 'undefined') ? yargs.argv.project : 'core'
const SWAGGER = (yargs.argv.swagger && yargs.argv.swagger !== 'undefined') ? yargs.argv.swagger : 'api.yaml'

const TEMPLATES = (yargs.argv.templates && yargs.argv.templates !== 'undefined') ? yargs.argv.templates : 'templates'
const OUTPUT = (yargs.argv.output && yargs.argv.output !== 'undefined') ? yargs.argv.output : 'dist'

const name = `${_.upperFirst(_.camelCase(PROJECT))}.ts`
const input = path.resolve(process.cwd(), SWAGGER)
const output = path.resolve(process.cwd(), OUTPUT)
const templates = path.resolve(process.cwd(), TEMPLATES)

generateApi({
  name,
  output,
  input,
  templates,
  httpClientType: "axios",
  generateResponses: true,
  extractRequestParams: true,
  cleanOutput: true,
  enumNamesAsValues: true,
  defaultResponseAsSuccess: false,
  generateRouteTypes: false,
  toJS: false,
  defaultResponseType: "void",
  singleHttpClient: true,
  moduleNameFirstTag: true,
  generateUnionEnums: false,
})
  .then(({ files, configuration }) => {
    files.forEach((file) => {
      console.log(`Generated file: ${file.name}`)
    });
  })
