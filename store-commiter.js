export default {
  install (Vue, {echo, channels, store, options}) {
    let self = this

    this.echo = echo
    this.store = store
    this.options = Object.assign({
      debug: false
    }, options)

    for (let i = 0; i < channels.length; i++) {
      this.echo.channel(channels[i])
        .listen('.laravel.vuex:mutation', (e) => {
          self.commit(e)
        });
    }
  },

  commit(event) {
    if(this.options.debug) {
      console.log('[LARAVEL VUEX] Mutation : ' + event.vuex.namespace + '/' + event.vuex.mutation + ' (' + event.vuex.state + ')')
      console.log(event.payload)
    }

    this.store.commit(event.vuex.namespace + '/' + event.vuex.mutation, {
      stateName: event.vuex.state,
      payload: event.payload
    })
  }
}
