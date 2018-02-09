import Vue from 'vue'
import EventEmitter from 'events'

class Collection extends EventEmitter {
  constructor (name, state, options) {
    super()

    // A vm for handling reactive datas
    this._vm = new Vue({data: {
      enabled: false,
      loading: false
    }})

    this.name = name
    this.state = state
    this.options = options
    this.filter = options.filter ? options.filter : false
    this.loader = options.loader
    this.bindings = null
    this.scopedIds = []

    this.watcher = () => {}
  }

  enable (bindings) {
    this.bindings = bindings

    this._populate()
    this._watchBindings()

    this._vm.$data.enabled = true

    this.emit('enabled')

    return this
  }

  disable () {
    this.scopedIds = []
    this._vm.$data.loading = false

    this._stopWatchBindings()

    this._vm.$data.enabled = false

    this.emit('disabled')

    return this
  }

  enabled () {
    return this._vm.$data.enabled
  }

  /*
   * Get one item from the collection or return null
   */
  get (offset) {
    let items = this.all()

    if (items[offset]) {
      return items[offset]
    } else {
      return null
    }
  }

  /*
   * Get all items from the collection
   */
  all () {
    let self = this

    if (this.filter === false) {
      return this.state.items().filter(item => self.scopedIds.includes(item.id))
    } else {
      return this.state.items().filter(item => {
        return self.filter.apply(self._getBindings(), [item])
      })
    }
  }

  loading () {
    return this._vm.$data.loading
  }

  refresh () {
    this._populate()
    return this
  }

  /*
   * Populate the collection with the collection loader
   */
  _populate () {
    let self = this

    self.emit('loading')
    self._vm.$data.loading = true

    this.loader.apply(this._getBindings(), null).then(items => {
      console.log('[ ELOQUENT VUEX ] Collection ' + self.state.module + '/' + self.state.state + '/' + self.name + ' loaded ' + items.length + ' items.')

      if (this.filter === false) {
        self.state._addItems(items)
        this.scopedIds = items.map(item => item.id)
      } else {
        self.state._addItems(items.filter(item => {
          return self.filter.apply(self._getBindings(), [item])
        }))
      }

      self.emit('loaded', items)
      self._vm.$data.loading = false
    })
  }

  /*
   * Enable the bindings watching in order to reload the item set when the params changes
   */
  _watchBindings () {
    let self = this
    let vue = new Vue()

    if (this.bindings) {
      this.watcher = vue.$watch(() => {
        return self.bindings
      }, (values) => {
        if (values !== false) {
          self._populate()
        }
      }, {
        deep: true
      })
    }
  }

  /*
   * Stop the bindings watching
   */
  _stopWatchBindings () {
    this.watcher()
  }

  /*
   * If the following item is not filtered out by the filter
   */
  _accepted (item) {
    return this._vm.$data.enabled && this.filter.apply(this._getBindings(), [item])
  }

  /*
   * Build a bindings object to be used for filter and loader
   */
  _getBindings () {
    return Object.assign(this.options, this.bindings)
  }
}

export default Collection
