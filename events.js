import EventEmitter from 'events'
const events = new EventEmitter()

export default {
  emit (event, options) {
    events.emit(event, options)
  },

  on (event, handler) {
    events.on(event, handler)
  },

  once (event, handler) {
    events.once(event, handler)
  }
}
