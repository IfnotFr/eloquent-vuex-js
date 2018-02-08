import EventEmitter from 'events'

class EventBus extends EventEmitter {
  emit (type) {
    super.emit.apply(this, arguments)
  }
}

export const events = new EventBus()
