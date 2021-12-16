const assert = require('assert')
const { CONTEXTS, dc, dcterms, oa, rdf, rdfs, sc, svcs } = require('./ns')

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

const COMMON_HTML = /<\/?(span|div|a|p|b|i|strong|em|ol|ul|li)\b[^>]*>/ig

function stripHTML(value) {
  if (typeof value === 'string')
    return value['@value'].replace(COMMON_HTML, '')

  if (value['@value']) {
    value['@value'] = value['@value'].replace(COMMON_HTML, '')
  }

  return value
}


class Resource {
  constructor(data = {}) {
    this.data = data
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
    return props.map(prop =>
      this.data[prop]?.map(value => stripHTML({ ...value })))
  }

  get metadata() {
    return this.data[sc('metadataLabels')]?.[0]['@list'] || []
  }

  getDescriptiveProperties() {
    let props = {}

    let [title, description, date] = this.values(
      rdfs('label'),
      dc('description'),
      sc('presentationDate'))

    if (title)
      props[dc('title')] = title
    if (description)
      props[dc('description')] = description
    if (date)
      props[dc('date')] = date

    return props
  }

  getRightsAndLicensingProperties() {
    let props = {}

    let [rights, attribution] = this.values(
      dcterms('rights'),
      sc('attributionLabel'))

    if (rights)
      props[dc('rights')] = rights
    if (attribution)
      props[rights ? dcterms('rightsHolder') : dc('rights')] = attribution

    return props
  }

  getTechnicalProperties() {
    let props = {}
    let identifier = this.data['@id']

    if (identifier)
      props[dc('identifier')] = identifier

    return props
  }

  getLinkingProperties() {
    let props = {}

    let [seeAlso, relation, isPartOf ] = this.values(
      rdfs('seeAlso'),
      dcterms('relation'),
      dcterms('isPartOf'))

    if (seeAlso)
      props[rdfs('seeAlso')] = seeAlso
    if (relation)
      props[dcterms('relation')] = relation
    if (isPartOf)
      props[dcterms('isPartOf')] = isPartOf

    return props
  }

  getMetadataProperties(map = {}) {
    let props = {}

    for (let m of this.metadata) {
      let id
      let labels = m[rdfs('label')] 
      let values = m[rdf('value')]?.map(stripHTML)

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
    let format  = body[dc('format')]?.[0]['@value']
    let service = body[svcs('has_service')]?.[0]

    if (service)
      return `${service['@id']}/full/full/0/default${Image.ext(format)}`
    else
      return body['@id']
  }
}

class Canvas extends Resource {
  get images() {
    return (
      this.data[sc('hasImageAnnotations')]?.[0]['@list'] || []
    ).map(data => new Image(data))
  }
}

class Manifest extends Resource {
  static async parse(data, jsonld) {
    let expanded = await expand(jsonld, data)   

    return expanded.map(manifest => {
      assert.equal(sc('Manifest'), manifest['@type']?.[0],
        'not a IIIF Presentation API 2.0 manifest')
      return new this(manifest)
    })
  }

  get canvases() {
    // Currently returns only the primary sequence!
    return (
      this.data[sc('hasSequences')]?.[0]['@list'][0][sc('hasCanvases')]?.[0]['@list'] || []
    ).map(data => new Canvas(data))
  }

  get images() {
    return this.canvases.flatMap(c => c.images)
  }
}

module.exports = {
  Canvas,
  Image,
  Manifest
}
