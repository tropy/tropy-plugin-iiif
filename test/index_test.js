const assert = require('assert')
const IIIFPlugin = require('../src/plugin.js')

describe('IIIF Plugin', () => {
  it('exists', () => {
    assert.equal(typeof IIIFPlugin, 'function')
  })

  it('responds to import hook', () => {
    assert.equal(typeof (new IIIFPlugin).import, 'function')
  })
})
