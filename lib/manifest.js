const assert = require('assert')
const { CONTEXTS, dc, dcterms, rdfs, sc } = require('./ns')

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
    return props.map(prop => this.data[prop])
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
      return { [dc('rights')]: rights }
    if (attribution)
      return { [dcterms('rightsHolder')]: attribution }

    return props
  }

  getTechnicalProperties() {
    return {
      [dc('identifier')]: this.data['@id']
    }
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

  getMetadataProperties(mapper) {
    let props = {}

    // TODO

    return props
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

  constructor(data = {}) {
    super(data)
  }
}

module.exports = {
  Manifest
}
