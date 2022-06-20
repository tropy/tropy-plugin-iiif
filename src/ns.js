const image = require('./contexts/image.v2.json')
const physdim = require('./contexts/physdim.v1.json')
const pv2 = require('./contexts/presentation.v2.json')
const pv3 = require('./contexts/presentation.v3.json')
const search = require('./contexts/search.v1.json')

const ns =
  (prefix) =>
  (name = '') =>
    `${prefix}${name}`

const alias = (ctx, name) => ns((ctx['@context'][0] || ctx['@context'])[name])

module.exports = {
  ns,
  dc: alias(pv2, 'dc'),
  dcterms: alias(pv2, 'dcterms'),
  iiif: alias(image, 'iiif'),
  oa: alias(pv2, 'oa'),
  rdf: alias(pv2, 'rdf'),
  rdfs: alias(pv2, 'rdfs'),
  sc: alias(pv2, 'sc'),
  svcs: alias(pv2, 'svcs'),

  CONTEXTS: {
    'http://iiif.io/api/image/2/context.json': image,
    'http://iiif.io/api/annex/services/physdim/1/context.json': physdim,
    'http://iiif.io/api/presentation/2/context.json': pv2,
    'http://iiif.io/api/presentation/3/context.json': pv3,
    'http://iiif.io/api/search/0/context.json': search,
    'http://iiif.io/api/search/1/context.json': search
  }
}
