import Vue from 'vue'

let iteminStore = (state, testItem) => {
  return state.filter(item => item.id === testItem.id).length > 0
}

export default {
  get () {
    return {
      fill (states, {state, items}) {
        states[state] = items
      },
      push (states, options) {
        if (options.item) {
          options.items = [options.item]
        }

        let items = []
        for (let i = 0; i < options.items.length; i++) {
          if (!iteminStore(states[options.state], options.items[i])) {
            items.push(options.items[i])
          }
        }
        states[options.state] = states[options.state].concat(items)
      },
      create (states, {state, item}) {
        if (!iteminStore(states[state], item)) {
          states[state] = states[state].concat(item)
        }
      },
      update (states, {state, item}) {
        let index = states[state].findIndex((testItem) => testItem.id === item.id)
        Vue.set(states[state], index, item)
      },
      delete (states, {state, item}) {
        let index = states[state].findIndex((testItem) => testItem.id === item.id)
        Vue.delete(states[state], index)
      }
    }
  }
}
