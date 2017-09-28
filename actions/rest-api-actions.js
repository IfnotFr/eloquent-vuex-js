import axios from 'axios'
import Vue from 'vue'

let parametrize = function (params, replacement) {
  if (!params) {
    return null
  }

  params = JSON.stringify(params)

  for (let name in replacement) {
    let regex = new RegExp(':' + name, 'g')
    params = params.replace(regex, replacement[name])
  }

  return JSON.parse(params)
}

export default {
  get (url, options) {
    options = Object.assign({
      axios: axios,
      reader: function (response) {
        return response.data.data
      },
      params: {
        fill: null,
        load: null,
        create: null,
        update: null,
        delete: null,
      }
    }, options)

    return {
      fill ({commit}, {state = 'all'} = {}) {
        let self = this

        return new Promise((resolve, reject) => {
          options.axios.get(url, {params: options.params.fill}).then(response => {
            // Get the data and fill the "all" store by commiting the "fill" mutation manually
            commit('fill', {state, items: options.reader(response)})

            resolve()
          })
        })
      },

      load ({commit}, {state = 'all', ids = []} = {}) {
        let self = this

        if (typeof id === 'object') {
          let id = ids.join(',')
        }

        return new Promise((resolve, reject) => {
          options.axios.get(url, {params: parametrize(options.params.load, {ids})}).then(response => {
            commit('push', {state, items: options.reader(response)})

            resolve()
          })
        })
      },

      empty ({commit}, {state = 'all'} = {}) {
        let self = this

        return new Promise((resolve, reject) => {
          commit('fill', {state, items: []})

          resolve()
        })
      },

      create ({commit}, {item}) {
        return new Promise((resolve, reject) => {
          options.axios.post(url, item, {params: options.params.create}).then(response => {
            // Here we dont commit any data as we prefer waiting the mutation
            // from the server through laravel-vuex

            resolve()
          })
        })
      },

      update ({commit}, {item}) {
        return new Promise((resolve, reject) => {
          options.axios.put(url + '/' + item.id, item, {params: options.params.update}).then(response => {
            // Here we dont commit any data as we prefer waiting the mutation
            // from the server through laravel-vuex

            resolve()
          })
        })
      },

      delete ({commit}, {item}) {
        return new Promise((resolve, reject) => {
          options.axios.delete(url + '/' + item.id, item, {params: options.params.delete}).then(response => {
            // Here we dont commit any data as we prefer waiting the mutation
            // from the server through laravel-vuex

            resolve()
          })
        })
      }
    }
  }
}
