class EchoDriver {
  constructor ({echo = null, channels = [], privateChannels = []} = {}) {
    // Try to load a window Echo registered if given
    if(echo === null && 'Echo' in window) {
      echo = window.Echo
    }

    this.echo = echo
    this.channels = channels
    this.privateChannels = privateChannels
  }

  install ({eloquentVuex, store, options}) {
    this.eloquentVuex = eloquentVuex
    this.options = options

    if (this.channels.length > 0) {
      this.listenPublic(this.channels)
    }
    if (this.privateChannels.length > 0) {
      this.listenPrivate(this.privateChannels)
    }
  }

  listenPublic (channels) {
    let self = this

    if (this.options.debug) console.log('[ ELOQUENT VUEX ] Listening to Echo public channels : ' + channels)

    for (let i = 0; i < channels.length; i++) {
      this.echo.channel(channels[i])
        .listen('.Ifnot\\EloquentVuex\\Events\\MutationEvent', (e) => {
          self.eloquentVuex.commit(e)
        })
    }
  }

  listenPrivate (channels) {
    let self = this

    if (this.options.debug) console.log('[ ELOQUENT VUEX ] Listening to Echo private channels : ' + channels)

    for (let i = 0; i < channels.length; i++) {
      this.echo.private(channels[i])
        .listen('.Ifnot\\EloquentVuex\\Events\\MutationEvent', (e) => {
          self.eloquentVuex.commit(e)
        })
    }
  }
}

export default EchoDriver
