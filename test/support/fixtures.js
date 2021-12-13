const fs = require('fs')
const { join } = require('path')

const ROOT = join(__dirname, '../fixtures')

global.F = {
  json(name) {
    return JSON.parse(fs.readFileSync(join(ROOT, `${name}.json`)))
  }
}
