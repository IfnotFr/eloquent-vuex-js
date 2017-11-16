import { events } from './event-bus'

export default {
  commit (store, event) {
    let options = {
      state: event.vuex.state,
      meta: event.meta,
    }

    if (event.vuex.mutation === 'fill') {
      options.items = event.payload
    } else {
      options.item = event.payload
    }

    events.emit(event.vuex.namespace + '/' + event.vuex.mutation, options)

    if (typeof store._modules.root._children[event.vuex.namespace]._rawModule.mutations[event.vuex.mutation] !== 'undefined') {
      store.commit(event.vuex.namespace + '/' + event.vuex.mutation, options)
    }
  },

  on (event, handler) {
    events.on(event, handler)
  }
}
