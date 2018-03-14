import EventEmitter from 'events'
import State from './eloquent/state'
import Collection from './eloquent/collection'

class EloquentVuex {
  constructor () {
    this.states = {}
    this.events = new EventEmitter()
  }

  install (Vue, {echo, store}, options) {
    this.echo = echo
    this.store = store

    this.options = this.getOptions(options)

    // Subscribing to channels
    if (this.options.channel.length > 0) {
      this.listenPublic(this.options.channel)
    }
    if (this.options.private.length > 0) {
      this.listenPrivate(this.options.channel)
    }

    // Binding this singleton proxified to vue
    Vue.prototype.$eloquent = new Proxy(this, {
      get: (target, name) => {
        if(name in target) {
          return target[name]
        } else {
          return new Proxy(target.states[name], {
            get: (target, name) => {
              return name in target ? target[name] : target.collections[name]
            }
          })
        }
      }
    })
  }

  createState (store, path) {
    let module = null
    let name = null

    if (path.indexOf('/') !== -1) {
      var lastIndex = path.lastIndexOf('/')
      module = path.substr(0, lastIndex)
      name = path.substr(lastIndex + 1)
    } else {
      module = null
      name = path
    }

    return new State(store, module, name)
  }

  create (states) {
    return store => {
      for (let stateName in states) {
        this.states[stateName] = this.createState(store, stateName)
        for (let collectionName in states[stateName]) {
          this.states[stateName]._addCollection(collectionName, new Collection(collectionName, this.states[stateName], states[stateName][collectionName]))
        }
      }
    }
  }

  getOptions (options) {
    return Object.assign({
      channel: [],
      private: [],
      debug: false
    }, options)
  }

  listenPublic (channels) {
    let self = this

    if (this.options.debug) console.log('[ ELOQUENT VUEX ] Listening to Echo public channels : ' + channels)

    for (let i = 0; i < channels.length; i++) {
      this.echo.channel(channels[i])
        .listen('.Ifnot\\EloquentVuex\\Events\\MutationEvent', (e) => {
          self.commit(e)
        })
    }
  }

  listenPrivate (channels) {
    let self = this

    if (this.options.debug) console.log('[ ELOQUENT VUEX ] Listening to Echo private channels : ' + channels)

    for (let i = 0; i < channels.length; i++) {
      this.echo.private(channels[i])
        .listen('.Ifnot\\EloquentVuex\\Events\\MutationEvent', (e) => {
          self.commit(e)
        })
    }
  }

  commit (event) {
    let mutationName = event.vuex.namespace + '/' + event.vuex.mutation
    let stateName = event.vuex.namespace + '/' + event.vuex.state
    let options = {
      state: event.vuex.state,
      meta: event.meta,
      item: event.payload
    }

    if (this.options.debug) {
      console.log('[ ELOQUENT VUEX ] Mutation : ' + mutationName, options)
    }

    let state = this.states[stateName]
    if (typeof(state) !== 'undefined') {
      if (event.vuex.mutation === 'create') {
        if (state._accepted(options.item)) {
          state._addItems([options.item])
        }
      } else if (event.vuex.mutation === 'update') {
        if (state._exists(options.item)) {
          state._updateItems([options.item])
        }
      } else if (event.vuex.mutation === 'delete') {
        if (state._exists(options.item)) {
          state._removeItems([options.item])
        }
      } else {
        this.store.commit(mutationName, options)
      }
    } else {
      this.store.commit(mutationName, options)
    }

    this.events.emit(mutationName, options)
  }

  on (event, handler) {
    this.events.on(event, handler)
  }

  once (event, handler) {
    this.events.once(event, handler)
  }
}

export let eloquentVuex = new EloquentVuex()
