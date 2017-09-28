export default {
  commit (store, event) {
    let options = {
      state: event.vuex.state,
    }

    if(event.vuex.mutation === 'fill') {
      options.items = event.payload
    } else {
      options.item = event.payload
    }

    store.commit(event.vuex.namespace + '/' + event.vuex.mutation, options)
  }
}
