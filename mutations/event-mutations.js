import Vue from 'vue'

export default {
  get () {
    return {
      fill (state, {stateName, payload}) {
        state[stateName] = payload
      },
      create (state, {stateName, payload}) {
        state[stateName].push(payload)
      },
      update (state, {stateName, payload}) {
        let index = state[stateName].findIndex((item) => item.id === payload.id)
        Vue.set(state[stateName], index, payload)
      },
      delete (state, {stateName, payload}) {
        let index = state[stateName].findIndex((item) => item.id === payload.id)
        Vue.delete(state[stateName], index)
      }
    }
  }
}