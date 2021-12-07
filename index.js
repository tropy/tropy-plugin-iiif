
class IIIFPlugin {
  constructor(options, context) {
    this.context = context
    this.options = {
      ...IIIFPlugin.defaults,
      ...options
    }
  }

  async import(payload) {
    payload.data = []
  }

  static defaults = {
    template: ''
  }
}

module.exports = IIIFPlugin
