import StoreCommiter from '../store-commiter'

class Echo {
  install (laravelVuex, options) {
    this.laravelVuex = laravelVuex

    if (options.echo) {
      this.laravelVuex.log('Listening Echo channels : ' + this.getChannels(options))
      for (let i = 0; i < this.getChannels(options).length; i++) {
        options.echo.channel(channels[i])
          .listen('.laravel.vuex:mutation', (e) => {
            this.laravelVuex.log('[ LARAVEL VUEX ] Received Echo mutation : ' + e.vuex.namespace + '/' + e.vuex.mutation + ' (' + e.vuex.state + ')')
            StoreCommiter.commit(store, e, options)
          })
      }
    }
  }

  getChannels (options) {
    if (options.channels) {
      return options.channels
    } else {
      return ['public']
    }
  }
}

export default Echo
