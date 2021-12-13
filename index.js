
class IIIFPlugin {
  constructor(options, context) {
    this.context = context
    this.options = {
      ...IIIFPlugin.defaults,
      ...options
    }
  }

  async import(payload) {
    // Prompt for file
    // Parse manifest
    // Convert
    payload.data = []
  }

  static defaults = {
    template: ''
  }
}

module.exports = IIIFPlugin
