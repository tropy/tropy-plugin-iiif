const assert = require('assert')
const jsonld = require('jsonld')
const { Manifest } = require('../lib/manifest')

describe('IIIF Manifest', () => {
  describe('.parse()', () => {
    it('accepts v2 manifests', async () => {
      let [mdz] = await Manifest.parse(F.json('mdz'), jsonld)
      assert.ok(mdz instanceof Manifest)

      let [bodleian] = await Manifest.parse(F.json('bodleian'), jsonld)
      assert.ok(bodleian instanceof Manifest)
    })

    it('ignores missing input', async () => {
      await assert.equal(0, (await Manifest.parse(null, jsonld)).length )
      await assert.equal(0, (await Manifest.parse({}, jsonld)).length)
    })

    it('throws for unsupported types', async () => {
      await assert.rejects(Manifest.parse({
        '@type': 'http://iiif.io/api/presentation/3#Manifest'
      }, jsonld))

      await assert.doesNotReject(
        Manifest.parse({
          '@type': 'http://iiif.io/api/presentation/2#Manifest'
        }, jsonld))
    })
  })  
})
