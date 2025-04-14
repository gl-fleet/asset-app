const { writeFileSync, existsSync } = require('node:fs')
const pkg = require('../package.json')
const env = process.env ?? {}
env.REACT_APP_NAME = pkg.name
env.REACT_APP_VERSION = pkg.version

const encodeENV = (_env = {}, key = 'REACT_APP_') => {
    const encode = {}
    for (const x in _env)
        encode[`${key}${x}`] = _env[x]
    return encode
}

const decodeENV = (key = 'REACT_APP_') => {
    const decode = {}
    for (const x in env)
        if (x.indexOf(key) === 0)
            decode[x.replace(key, '')] = env[x]?.indexOf(',') !== -1 ? env[x]?.split(',') : env[x]
    return decode
}

const generateENV = () => {

    existsSync('./public') && writeFileSync('./public/env.js', "var env = " + JSON.stringify(decodeENV()) + "; window.env = env;")
    existsSync('./build') && writeFileSync('./build/env.js', "var env = " + JSON.stringify(decodeENV()) + "; window.env = env;")

}

exports.encodeENV = encodeENV
exports.decodeENV = decodeENV
exports.generateENV = generateENV