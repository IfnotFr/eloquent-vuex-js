import EventEmitter from 'events'
import State from './eloquent/state'
import Collection from './eloquent/collection'
import Events from './events'

class EloquentVuex {
  constructor () {
    this.states = {}
    this.store = null
    this.events = Events
    this.driver = null
  }

  create (options) {
    let self = this

    this.options = Object.assign({
      debug: false
    }, options)

    setInterval(() => {
      self._garbageCollector()
    }, 5000)

    return store => {
      self.store = store

      if ('driver' in this.options) {
        self.driver = this.options['driver']
        self.driver.install({eloquentVuex: self, store, options: self.options})
      } else {
        console.warn('[ ELOQUENT VUEX ] No sync driver specified. No data will be synchronized.')
      }

      store.collections = {}

      // Searching for all modules availables
      for (let namespace in store._modulesNamespaceMap) {
        let module = store._modulesNamespaceMap[namespace]._rawModule
        namespace = namespace.replace(/\/$/, "")

        // If the current module has come collections to be registered
        if ('collections' in module) {
          for (let collectionName in module.collections) {
            let collection = module.collections[collectionName]

            if(!('state' in collection)) {
              console.error('[ ELOQUENT VUEX ] Could not build collection ' + namespace + '/' + collectionName + ', no state specified.')
              continue
            }

            let stateName = namespace + '/' + collection.state

            // Check if the collection state need to be created
            if (!(stateName in this.states)) {
              this.states[stateName] = new State(store, namespace, collection.state)
            }

            // Create the collection into the state
            let instance = new Collection(collectionName, this.states[stateName], collection)
            this.states[stateName]._addCollection(collectionName, instance)

            // Build the collection accessor into the store
            store.collections[namespace + '/' + collectionName] = instance
          }
        }
      }
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

  _garbageCollector() {
    for(let name in this.states) {
      let state = this.states[name]
      state._garbageCollector()
    }
  }
}

export let eloquentVuex = new EloquentVuex()
