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
  as: alias(pv3, 'as'),
  dc: alias(pv3, 'dc'),
  dcterms: alias(pv3, 'dcterms'),
  iiif_image: alias(image, 'iiif_image'),
  oa: alias(pv3, 'oa'),
  rdf: alias(pv3, 'rdf'),
  rdfs: alias(pv3, 'rdfs'),
  iiif_prezi: alias(pv3, 'iiif_prezi'),
  schema: alias(pv3, 'schema'),
  svcs: alias(pv3, 'svcs'),

  CONTEXTS: {
    'http://iiif.io/api/image/2/context.json': image,
    'http://iiif.io/api/annex/services/physdim/1/context.json': physdim,
    'http://iiif.io/api/presentation/2/context.json': pv2,
    'http://iiif.io/api/presentation/3/context.json': pv3,
    'http://iiif.io/api/search/0/context.json': search,
    'http://iiif.io/api/search/1/context.json': search
  }
}
