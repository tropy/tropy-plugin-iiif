const { readFile } = require('fs/promises')
const { Manifest } = require('./lib/manifest')
const LABELS = require('./labels.json')

class IIIFPlugin {
  constructor(options, context) {
    this.context = context
    this.options = {
      ...IIIFPlugin.defaults,
      ...options
    }
  }

  async import(payload) {
    let { files } = payload

    if (!files)
      files = await this.prompt()
    if (!files)
      return

    payload.data = []

    for (let file of files) {
      try {
        let data = JSON.parse(await readFile(file))
        let [manifest] = await Manifest.parse(data, this.context.json)
        console.log('x')

        payload.data.push(this.convert(manifest))
      } catch (e) {
        this.context.logger.warn(
          {
            stack: e.stack
          },
          `failed to import IIIF manifest ${file}`
        )
      }
    }
  }

  convert(manifest) {
    let { props, canvases } = manifest
    let { itemTemplate, photoTemplate } = this.options

    let iMap = this.mapLabelsToIds(this.loadTemplate(itemTemplate))
    let pMap = this.mapLabelsToIds(this.loadTemplate(photoTemplate))

    return {
      ...props,
      ...manifest.getMetadataProperties(iMap),
      template: itemTemplate || undefined,
      photo: canvases.flatMap((c) =>
        c.images.map((i) => ({
          ...c.props,
          ...c.getMetadataProperties(pMap),
          ...i.props,
          ...i.getMetadataProperties(pMap),
          template: photoTemplate || undefined
        }))
      )
    }
  }

  mapLabelsToIds(template) {
    if (!template)
      return LABELS

    let map = {}

    for (let { label, property } of template.fields) {
      if (label) map[label] = property
    }

    return map
  }

  loadTemplate(id) {
    return this.context.window.store?.getState().ontology.template[id]
  }

  prompt() {
    return this.context.dialog.open({
      filters: [
        {
          name: 'IIIF Manifests',
          extensions: ['json']
        }
      ],
      properties: ['openFile', 'multiSelections']
    })
  }

  static defaults = {
    itemTemplate: '',
    photoTemplate: ''
  }
}

module.exports = IIIFPlugin
