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

    if (['create', 'update', 'delete'].indexOf(event.vuex.mutation) !== -1) {
      store.commit(event.vuex.namespace + '/' + event.vuex.mutation, options)
    }
  },

  on (event, handler) {
    events.on(event, handler)
  }
}
