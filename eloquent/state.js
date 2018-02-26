import _ from 'lodash'
import Collection from './collection'

class State {
  constructor (store, module, state) {
    this.store = store
    this.module = module
    this.state = state
    this.collections = {}

    let self = this
    setInterval(() => {
      self._garbageCollector()
    }, 60 * 1000)
  }

  /*
   * Return all the items hold by the state
   */
  items () {
    return this.store.state[this.module][this.state]
  }

  /*
   * Add items with a store mutation
   */
  _addItems (items) {
    this.store.commit(this.module + '/create', {state: this.state, items})
    this._notifyCollections(items, 'create')
  }

  /*
   * Remove items with a store mutation
   */
  _removeItems (items) {
    this.store.commit(this.module + '/delete', {state: this.state, items})
    this._notifyCollections(items, 'delete')
  }

  /*
   * Update items with a store mutation
   */
  _updateItems (items) {
    this.store.commit(this.module + '/update', {state: this.state, items})
    this._notifyCollections(items, 'update')
  }

  /*
   * Add a new collection to this state
   */
  _addCollection(name, collection) {
    this.collections[name] = collection
  }

  /*
   * Remove an added collection from this state
   */
  _removeCollection(name) {
    delete this.collections[name]
  }

  /*
   * Return if this state has this collection
   */
  _hasCollection(name) {
    return typeof(this.collections[name]) !== 'undefined'
  }

  /*
   * Dispatch an event informing the collections that something changed on the state.
   * But before sending this event, we check if the collection accept this item, we
   * dont want to notify collections who do not care
   */
  _notifyCollections(items, event) {
    let self = this

    for (let name in this.collections) {
      let collection = self.collections[name]
      let collectionItems = items.filter(item => collection._accepted(item))
      if(collectionItems.length > 0) {
        this.collections[name].emit('updated', collection.all())
        this.collections[name].emit('mutation:' + event, collectionItems)
      }
    }
  }

  /*
   * The garbage collector is ran regulary for checking if there is items not required
   * by any collection in this state. For each of these items the garbage collector run
   * a delete mutation for these items.
   */
  _garbageCollector () {
    let self = this

    let items = this.items().filter(item => {
      return !self._accepted(item)
    })

    if(items.length > 0) {
      console.log('[ ELOQUENT VUEX ] Garbage collector scanned ' + this.module + '/' + this.state + ' and deleted ' + items.length + ' items.')
      this._removeItems(items)
    }
  }

  /*
   * If this item is compatible with this state (thought all created collections into it)
   */
  _accepted (item) {
    for (let name in this.collections) {
      if(this.collections[name]._accepted(item)) {
        return true
      }
    }

    return false
  }

  /*
   * If this item exists in the state
   */
  _exists (item) {
    return typeof(this.items().find(testItem => {
      return testItem.id === item.id
    })) !== 'undefined'
  }

  /*
   * Notify the state for edited datas
   */
  _notify () {
    this.store.state[this.module][this.state].__ob__.dep.notify()
  }
}

export default State
