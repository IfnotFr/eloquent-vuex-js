import Vue from 'vue'
import EventEmitter from 'events'

class Collection extends EventEmitter {
  constructor (state, options) {
    super()

    this.state = state
    this.options = options
    this.filter = options.filter ? options.filter : false
    this.loader = options.loader
    this.bindings = null
    this.scopedIds = []

    this.working = false
    this.watcher = () => {}
  }

  enable (bindings) {
    this.bindings = bindings

    this._populate()
    this._watchBindings()

    this.emit('enabled')

    return this
  }

  disable () {
    this.scopedIds = []
    this.working = false

    this._stopWatchBindings()

    this.emit('disabled')

    return this
  }

  /*
   * Get one item from the collection or return null
   */
  get (offset) {
    let items = this.items()

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
    if (this.filter === false) {
      let self = this
      return this.state.items().filter(item => self.scopedIds.includes(item.id))
    } else {
      return this.state.items().filter(this.filter)
    }
  }

  refresh () {
    this._populate()
    return this
  }

  loading () {
    return this.working
  }

  /*
   * Populate the collection with the collection loader
   */
  _populate () {
    let self = this

    self.emit('loading')
    this.working = true

    this.loader.apply(this._getBindings(), null).then(items => {
      console.log('[ ELOQUENT VUEX ] Eloquent : loaded ' + items.length + ' items into ' + self.state.module + '/' + self.state.state + '.')

      if (this.filter === false) {
        self.state._addItems(items)
        this.scopedIds = items.map(item => item.id)
      } else {
        self.state._addItems(items.filter(item => {
          return self.filter.apply(self._getBindings(), [item])
        }))
      }

      self.emit('loaded', items)
      self.working = false
    })
  }

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

  _stopWatchBindings () {
    this.watcher()
  }

  /*
   * If the following item is not filtered out by the filter
   */
  _accepted (item) {
    return this.filter(item)
  }

  _getBindings () {
    return Object.assign(this.options, this.bindings)
  }
}

export default Collection
