import Vue from 'vue'
import EventEmitter from 'events'

class Collection extends EventEmitter {
  constructor (name, state, handler) {
    super()

    // A vm for handling reactive datas
    this._vm = new Vue({
      data: {
        enabled: false,
        loading: false
      }
    })

    this.name = name
    this.state = state
    this.handler = handler
    this.handler.collection = this
    this.options = null
    this.scopedIds = []

    this.watchers = {
      options: null,
      items: null
    }
  }

  enable (options) {
    if (this.enabled()) {
      this.refresh(options)
      return this
    }

    this._setOptions(options)

    this._populate()
    this._watchOptions()

    this._vm.$data.enabled = true

    this.emit('enabled')

    return this
  }

  disable () {
    this.scopedIds = []
    this._vm.$data.loading = false

    this._stopWatchItems()
    this._stopWatchOptions()

    this._vm.$data.enabled = false

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
      this.disable()
    }

    delete this.state._removeCollection(this.name)
  }

  refresh (options) {
    if (options) {
      this._setOptions(options)
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

    if (this.handler.filter) {
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
        console.warn('[ ELOQUENT VUEX ] Collection ' + self.state.module + '/' + self.state.state + '/' + self.name + ' loaded ' + items.length + ' items, but filtered ' + (items.length + filtered.length) + ' of them directly. Make sure your loader and your filter conditions are similar in order to optimize items loading.')
      }

      self.state._addItems(filtered)
    } else {
      self.state._addItems(items)
      this.scopedIds = items.map(item => item.id)
    }
  }

  _setOptions (options) {
    this.handler.options = options
    this.options = options
  }

  /*
   * Populate the collection with the collection loader
   */
  _populate () {
    let self = this

    self.emit('loading')
    self._vm.$data.loading = true

    this.handler.loader().then(items => {
      console.log('[ ELOQUENT VUEX ] Collection ' + self.state.module + '/' + self.state.state + '/' + self.name + ' loaded ' + items.length + ' items.')

      self.addItems(items)

      self.emit('updated', self.all())
      self.emit('loaded', self.all())
      self._vm.$data.loading = false

      this._stopWatchItems()
      this._watchItems()
    })
  }

  _watchItems () {
    let self = this
    let vue = new Vue()

    if (this.watchers.items === null) {
      this.watchers.items = vue.$watch(() => {
        return this.all()
      }, (values) => {
        self.emit('updated', self.all())
      })
    }
  }

  /*
   * Stop the bindings watching
   */
  _stopWatchItems () {
    if (this.watchers.items) {
      this.watchers.items()
    }
  }

  /*
   * Enable the options watching in order to reload the item set when the params changes
   */
  _watchOptions () {
    let self = this
    let vue = new Vue()

    if (this.options) {
      this.watchers.options = vue.$watch(() => {
        return self.options
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
    if (this.watchers.options) {
      this.watchers.options()
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
