const assert = require('assert')
const jsonld = require('jsonld')
const { Canvas, Image, Manifest } = require('../src/manifest')

describe('IIIF Manifest', () => {

  describe('.parse()', () => {
    it('accepts v3 manifests', async () => {
      await assert.doesNotReject(
        Manifest.parse({
          '@type': 'http://iiif.io/api/presentation/3#Manifest'
        }, jsonld))
    })

    it('ignores missing input', async () => {
      await assert.equal(0, (await Manifest.parse(null, jsonld)).length)
      await assert.equal(0, (await Manifest.parse({}, jsonld)).length)
    })

    it('throws for unsupported types', async () => {
      await assert.rejects(Manifest.parse({
        '@type': 'http://iiif.io/api/presentation/4#Manifest'
      }, jsonld))
    })
  })

  describe('fixtures', () => {
    let bodleian, mdz, loc, northwestern

    before(async () => {
      bodleian = (await Manifest.parse(F.json('bodleian'), jsonld))[0]
      mdz = (await Manifest.parse(F.json('mdz'), jsonld))[0]
      loc = (await Manifest.parse(F.json('loc'), jsonld))[0]
      northwestern = (await Manifest.parse(F.json('northwestern'), jsonld))[0]
    })

    it('are manifest instances', () => {
      assert.ok(bodleian instanceof Manifest)
      assert.ok(mdz instanceof Manifest)
      assert.ok(loc instanceof Manifest)
      assert.ok(northwestern instanceof Manifest)
    })

    it('have core props', () => {
      assert.ok('http://purl.org/dc/elements/1.1/title' in bodleian.props)
      assert.ok('http://purl.org/dc/elements/1.1/rights' in mdz.props)
      assert.ok('http://purl.org/dc/elements/1.1/rights' in loc.props)
      assert.ok('http://purl.org/dc/elements/1.1/rights' in northwestern.props)
    })

    it('skips blank props', () => {
      assert.ok(!('http://www.w3.org/2000/01/rdf-schema#seeAlso' in loc.props))
    })

    it('have canvases', () => {
      assert.ok(bodleian.canvases.every(c => c instanceof Canvas))
      assert.ok(mdz.canvases.every(c => c instanceof Canvas))
      assert.ok(loc.canvases.every(c => c instanceof Canvas))
      assert.ok(northwestern.canvases.every(c => c instanceof Canvas))
    })

    it('have images', () => {
      assert.ok(bodleian.images.map(i => i instanceof Image))
      assert.ok(mdz.images.every(i => i instanceof Image))
      assert.ok(loc.images.every(i => i instanceof Image))
      assert.ok(northwestern.images.every(i => i instanceof Image))
    })

    it('prop values are stripped of html', () => {
      assert.doesNotMatch(
        bodleian.props['http://purl.org/dc/elements/1.1/rights'][0]['@value'],
        /<\//
      )
    })
  })
})
