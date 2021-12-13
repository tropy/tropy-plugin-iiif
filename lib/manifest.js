const assert = require('assert')
const { CONTEXTS, sc } = require('./ns')

async function expand(jsonld, data) {
  return jsonld.expand(data, {
    documentLoader: (url, options) => {
      if (url in CONTEXTS) {
        return {
          contextUrl: null,
          document: CONTEXTS[url],
          documentUrl: url
        }
      }

      console.warn('fetching uncached context', url)

      return jsonld.documentLoader?.(url, options) ||
        jsonld.documentLoaders.node()(url, options)
    }
  })
}

class Manifest {
  static async parse(data, jsonld) {
    let expanded = await expand(jsonld, data)   

    return expanded.map(manifest => {
      assert.equal(sc('Manifest'), manifest['@type']?.[0],
        'not a IIIF Presentation API 2.0 manifest')
      return new this(manifest)
    })
  }

  constructor(data = {}) {
    this.data = data
  }
}

module.exports = {
  Manifest
}
