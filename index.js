const { readFile } = require('fs/promises')
const { Manifest } = require('./lib/manifest')

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
        this.context.logger.warn({
          stack: e.stack
        }, `failed to import IIIF manifest ${file}`)
      }
    }
  }

  convert(manifest) {
    let { props, canvases } = manifest

    return {
      ...props,
      photo: canvases.flatMap(c => c.images.map(i => ({
        ...c.props,
        ...i.props
      })))
    }
  }

  prompt() {
    return this.context.dialog.open({
      filters: [{
        name: 'IIIF Manifests',
        extensions: ['json']
      }],
      properties: ['openFile', 'multiSelections']
    })
  }


  static defaults = {
    template: ''
  }
}

module.exports = IIIFPlugin
