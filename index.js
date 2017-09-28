import Echo from './plugins/echo'
import PartialState from './plugins/partial-state'

class LaravelVuex extends Function {
  constructor (options) {
    super('...args', 'return this.init(...args)')

    this.options = Object.assign({
      debug: false,
      plugins: [
        new Echo,
        new PartialState
      ]
    }, options)

    return this.bind(this)
  }

  init (store) {
    this.store = store

    for (let i = 0; i < this.options.plugins.length; i++) {
      let plugin = this.options.plugins[i]
      plugin.install(this, this.options)
    }
  }

  log (message) {
    if (this.options && this.options.debug) {
      console.log('[ LARAVEL VUEX ] ' + message)
    }
  }
}

export default LaravelVuex
