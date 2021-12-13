const image = require('../contexts/image.v2.json')
const physdim = require('../contexts/image.v2.json')
const pv2 = require('../contexts/presentation.v2.json')
const pv3 = require('../contexts/presentation.v3.json')

const ns = (prefix) =>
  (name = '') => `${prefix}${name}`

module.exports = {
  ns,
  iiif: ns(image['@context'].iiif),
  sc: ns(pv2['@context'][0].sc),

  CONTEXTS: {
    'http://iiif.io/api/image/2/context.json': image,
    'http://iiif.io/api/annex/services/physdim/1/context.json': physdim,
    'http://iiif.io/api/presentation/2/context.json': pv2,
    'http://iiif.io/api/presentation/3/context.json': pv3
  }
}
