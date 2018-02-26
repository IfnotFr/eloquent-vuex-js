import Vue from 'vue'
import EventEmitter from 'events'

class Collection extends EventEmitter {
  constructor (name, state, handler) {
    super()

    let self = this

    // A vm for handling reactive datas
    this._vm = new Vue({
      data () {
        return {
          enabled: false,
          enableCount: 0,
          loading: false,
          options: {}
        }
      },
      watch: {
        enableCount (count) {
          if(count === 0 && this.enabled) {
            self._disable()
          }
        }
      }
    })

    this.name = name
    this.state = state
    this.handler = handler
    this.handler.collection = this
    this.scopedIds = []
    this.watcher = null
  }

  enable (options, params) {
    params = Object.assign({
      watch: true,
      count: true
    }, params)

    if(params.count) {
      this._vm.$data.enableCount++
    }

    if (this.enabled()) {
      return this.refresh(options)
    }

    this._setOptions(options)
    if(params.watch) {
      this._watchOptions()
    }

    this._populate()

    this._vm.$data.enabled = true

    return this
  }

  disable (force) {
    if(force) {
      this._vm.$data.enableCount = 0
    } else {
      this._vm.$data.enableCount--
    }

    return this
  }

  _disable () {
    this.scopedIds = []
    this._vm.$data.loading = false
    this._vm.$data.enabled = false
    this._stopWatchOptions()

    this.removeAllListeners()

    this.emit('disabled')

    return this
  }

  clone () {
    let number = 1
    let name = null
    do {
      name = this.name + '_(clone_' + number + ')'
      number++
    } while (this.state._hasCollection(name))

    let collection = new Collection(name, this.state, Object.assign({}, this.handler))
    this.state._addCollection(name, collection)
    return collection
  }

  destroy () {
    if (this.enabled()) {
      this.disable(true)
    }

    delete this.state._removeCollection(this.name)
  }

  refresh (options) {
    let watch = this._isWatchingOptions()

    if (options) {
      if(watch) this._stopWatchOptions()
      this._setOptions(options)
      if(watch) this._watchOptions()
    }

    this._populate()

    return this
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

    if (!this.enabled()) {
      return []
    }
    else if (this.handler.filter) {
      return this.state.items().filter(item => {
        return self.handler.filter(item)
      })
    } else {
      return this.state.items().filter(item => self.scopedIds.includes(item.id))
    }
  }

  loading () {
    return this._vm.$data.loading
  }

  enabled () {
    return this._vm.$data.enabled
  }

  addItems(items) {
    let self = this

    if (this.handler.filter) {
      let filtered = items.filter(item => {
        return self.handler.filter(item)
      })

      if (filtered.length !== items.length) {
        console.warn('[ ELOQUENT VUEX ] Collection ' + self.state.module + '/' + self.state.state + '/' + self.name + ' loaded ' + items.length + ' items, but filtered ' + (items.length - filtered.length) + ' of them directly. Make sure your loader and your filter conditions are similar in order to optimize items loading.')
      } else {
        console.log('[ ELOQUENT VUEX ] Collection ' + self.state.module + '/' + self.state.state + '/' + self.name + ' loaded ' + items.length + ' items.')
      }

      if(filtered.length > 0) {
        self.state._addItems(filtered)
      } else {
        // If there is no items to be added into the store, we must still send the updated event
        this.emit('updated', this.all())
        this.emit('mutation:create', filtered)
      }
    } else {
      self.state._addItems(items)
      this.scopedIds = items.map(item => item.id)
    }
  }

  _setOptions (options) {
    this.handler.options = options
    this._vm.$data.options = options
  }

  /*
   * Populate the collection with the collection loader
   */
  _populate () {
    let self = this

    self.emit('loading')
    self._vm.$data.loading = true

    this.handler.loader().then(items => {
      self.addItems(items)

      self.emit('loaded', self.all())
      self._vm.$data.loading = false

      // Notify the dataset
      self.state._notify()
    })
  }

  _isWatchingOptions () {
    return this.watcher !== null
  }

  /*
   * Enable the options watching in order to reload the item set when the params changes
   */
  _watchOptions () {
    let self = this
    let vue = new Vue()

    if (this.watcher === null) {
      this.watcher = vue.$watch(() => {
        return self._vm.$data.options
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
  _stopWatchOptions () {
    if (this.watcher) {
      this.watcher()
      this.watcher = null
    }
  }

  /*
   * If the following item is not filtered out by the filter
   */
  _accepted (item) {
    return this._vm.$data.enabled && this.handler.filter(item)
  }
}

export default Collection
