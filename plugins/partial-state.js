import _ from 'lodash'
import Vue from 'vue'

let vue = new Vue

class PartialState {
  install (laravelVuex, options) {
    let self = this
    let store = laravelVuex.store

    if (options.partialStates) {
      for (let i = 0; i < options.partialStates.length; i++) {
        let partial = options.partialStates[i]

        console.log('[ LARAVEL VUEX ] Watching ids ' + partial.namespace + '/' + partial.getter + ' for state ' + partial.namespace + '/' + partial.state)

        vue.$watch(() => {
          return store.getters[partial.namespace + '/' + partial.getter]
        }, (newValues, oldValues) => {
          self.syncItems(store, partial, oldValues, newValues)
        })
      }
    }
  }

  syncItems (store, partial, oldValues, newValues) {
    let added = _.difference(newValues, oldValues)
    let deleted = _.difference(oldValues, newValues)

    console.log('[ LARAVEL VUEX ] ' + partial.namespace + '/' + partial.state + ' : ', 'added', added, 'deleted', deleted)

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
      let chunk = 100
      let j = ids.length

      for (let i = 0; i < j; i += chunk) {
        store.dispatch(namespace + '/load', {state, ids: ids.slice(i, i + chunk)})
      }
    }
  }
}

export default PartialState
