import EventEmitter from 'events'

class EventBus extends EventEmitter {
  emit (type) {
    console.log('[ LARAVEL VUEX ] Event received : ' + type)
    super.emit.apply(this, arguments)
  }
}

export const events = new EventBus()
