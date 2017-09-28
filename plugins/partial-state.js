import _ from 'lodash'
import Vue from 'vue'

let vue = new Vue

class PartialState {
  install (laravelVuex, options) {
    this.laravelVuex = laravelVuex

    let self = this
    let store = laravelVuex.store

    if (options.partialStates) {
      for (let i = 0; i < options.partialStates.length; i++) {
        let partial = options.partialStates[i]

        this.laravelVuex.log('Watching : ' + partial.namespace + '/' + partial.getter + ' for sycing partial state ' + partial.namespace + '/' + partial.state)

        vue.$watch(() => {
          return store.getters[partial.namespace + '/' + partial.getter]
        }, (newValues) => {
          let oldValues = store.state.clients[partial.state].map(item => item.id)
          self.syncItems(store, partial, oldValues, newValues)
        })
      }
    }
  }

  syncItems (store, partial, oldValues, newValues) {
    let added = _.difference(newValues, oldValues)
    let deleted = _.difference(oldValues, newValues)

    this.laravelVuex.log('Sycing added : "' + added + '", and deleted "' + deleted + '" to ' + partial.namespace + '/' + partial.state)

    this.deleteItems(store, partial.namespace, partial.state, deleted)
    this.loadItems(store, partial.namespace, partial.state, added)
  }

  deleteItems (store, namespace, state, ids) {
    if (ids.length > 0) {
      for (let i = 0; i < ids.length; i++) {
        store.commit(namespace + '/delete', {
          state,
          item: {
            id: ids[i]
          }
        })
      }
    }
  }

  loadItems (store, namespace, state, ids) {
    if (ids.length > 0) {
      store.dispatch(namespace + '/load', {state, ids})
    }
  }
}

export default PartialState
