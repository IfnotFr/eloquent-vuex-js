import Vue from 'vue'

let isItemInStore = (state, testItem) => {
  return state.filter(item => item.id === testItem.id).length > 0
}

let getItems = ({item, items}) => {
  if (items.length === 0 && item !== null) {
    items.push(item)
  }

  return items
}

export default {
  get () {
    return {
      create (states, {state = null, item = null, items = []} = {}) {
        items = getItems({item, items})

        for (let i = 0; i < items.length; i++) {
          if (!isItemInStore(states[state], items[i])) {
            states[state].push(items[i])
          }
        }
      },
      update (states, {state = null, item = null, items = []} = {}) {
        items = getItems({item, items})

        for (let i = 0; i < items.length; i++) {
          let index = states[state].findIndex((testItem) => testItem.id === items[i].id)
          Vue.set(states[state], index, items[i])
        }
      },
      delete (states, {state = null, item = null, items = []} = {}) {
        items = getItems({item, items})

        for (let i = 0; i < items.length; i++) {
          let index = states[state].findIndex((testItem) => testItem.id === items[i].id)
          Vue.delete(states[state], index)
        }
      }
    }
  }
}
