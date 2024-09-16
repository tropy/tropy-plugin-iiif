const assert = require('assert')
const { CONTEXTS, as, dc, dcterms, oa, rdf, rdfs, iiif_prezi, schema } = require('./ns')

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

      return jsonld.documentLoader(url, options)
    }
  })
}

const LINK = /<a[^h]+href=['"]([^'"]+)['"][^>]*>([^<]*)<\/a>/gi
const HTML = /<\/?(span|div|a|p|b|i|strong|em|ol|ul|li)\b[^>]*>/gi

function stripHTML(string) {
  return string.replace(LINK, '$2 [$1]').replace(HTML, '')
}

function strip(value) {
  if (typeof value === 'string')
    value = stripHTML(value)

  if (value['@value'])
    value['@value'] = stripHTML(value['@value'])

  return value
}

function blank(value) {
  return value == null || value.length === 0
}

class Resource {
  constructor(data = {}, isUpgraded = false) {
    this.data = data
    this.isUpgraded = isUpgraded
  }

  get props() {
    return {
      ...this.getDescriptiveProperties(),
      ...this.getRightsAndLicensingProperties(),
      ...this.getTechnicalProperties(),
      ...this.getLinkingProperties()
    }
  }

  values(...props) {
    return props.map((prop) =>
      this.data[prop]?.map((value) => strip({ ...value }))
    )
  }

  get metadata() {
    return this.data[iiif_prezi('metadataEntries')]?.[0]['@list'] || []
  }

  getDescriptiveProperties() {
    let props = {}

    let [title, description, date] = this.values(
      rdfs('label'),
      dc('description'),
      iiif_prezi('navigationDate')
    )

    if (!blank(title))
      props[dc('title')] = title
    if (!blank(description))
      props[dc('description')] = description
    if (!blank(date))
      props[dc('date')] = date

    return props
  }

  getRightsAndLicensingProperties() {
    let props = {}

    let [rights, attribution] = this.values(
      dcterms('rights'),
      iiif_prezi('requiredStatement')
    )

    if (!blank(rights))
      props[dc('rights')] = rights
    if (!blank(attribution))
      props[rights ? dcterms('rightsHolder') : dc('rights')] = attribution

    return props
  }

  getTechnicalProperties() {
    let props = {}
    let identifier = this.data['@id']

    if (!blank(identifier))
      props[dc('identifier')] = identifier

    return props
  }

  getLinkingProperties() {
    let props = {}

    let [seeAlso, relation, isPartOf] = this.values(
      rdfs('seeAlso'),
      dcterms('relation'),
      dcterms('isPartOf')
    )

    if (!blank(seeAlso))
      props[rdfs('seeAlso')] = seeAlso
    if (!blank(relation))
      props[dcterms('relation')] = relation
    if (!blank(isPartOf))
      props[dcterms('isPartOf')] = isPartOf

    return props
  }

  getMetadataProperties(map = {}) {
    let props = {}

    for (let m of this.metadata) {
      let id
      let labels = m[rdfs('label')]
      let values = m[rdf('value')]?.map(strip)

      if (!values) continue

      for (let label of labels) {
        id = map[label['@value'] || label]
        if (id) break
      }

      if (!id) continue

      if (id in props)
        props[id] = [...props[id], ...values]
      else
        props[id] = values
    }

    return props
  }
}

class Image extends Resource {
  static ext(format) {
    switch (format) {
      case 'image/tiff':
        return '.tif'
      case 'image/png':
        return '.png'
      case 'image/gif':
        return '.gif'
      case 'image/jp2':
        return '.jp2'
      case 'application/pdf':
        return '.pdf'
      case 'image/webp':
        return '.webp'
      default:
        return '.jpg'
    }
  }

  get props() {
    let props = super.props
    let [protocol, path] = this.url.split('://', 2)

    return {
      ...props,
      protocol,
      path
    }
  }

  get url() {
    let [body] = this.values(oa('hasBody'))[0]
    let format = body[dc('format')]?.[0]['@value']
    let service = body[schema('potentialAction')]?.[0]
    return service ?
      (this.isUpgraded ?
      `${service['@id']}/full/full/0/default${Image.ext(format)}` :
      `${service['@id']}/full/max/0/default${Image.ext(format)}`) :
      body['@id']
  }
}

class Canvas extends Resource {
  get images() {
    return (this.data[
      as('items')]?.[0]['@list'][0][as('items')]?.[0]['@list'] || []).map(
      (data) => new Image(data, this.isUpgraded)
    )
  }
}

class Manifest extends Resource {
  static async parse(data, jsonld, isUpgraded) {
    let expanded = await expand(jsonld, data)
    return expanded.map((manifest) => {
      assert.equal(
        iiif_prezi('Manifest'),
        manifest['@type']?.[0],
        'not a IIIF Presentation API 3.0 manifest'
      )
      return new this(manifest, isUpgraded)
    })
  }

  get canvases() {
    // Currently returns only the primary sequence!
    return (
      this.data[as('items')]?.[0]['@list'] || []
    ).map(
      (data) => new Canvas(data, this.isUpgraded)
    )
  }

  get images() {
    return this.canvases.flatMap((c) => c.images)
  }
}

module.exports = {
  Canvas,
  Image,
  Manifest
}
