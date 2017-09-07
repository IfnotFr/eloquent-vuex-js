import axios from 'axios'

export default {
  get (url, options) {
    options = Object.assign({
      reader: function(response) {
        return response.data.data
      },
      params: {
        fill: null,
        create: null,
        update: null,
        delete: null,
      }
    }, options)

    return {
      /*
       * Fill the "all" state by making a GET request to the endpoint
       */
      fill ({commit}) {
        let self = this

        return new Promise((resolve, reject) => {
          axios.get(url, {params: options.params.fill}).then(response => {
            // Get the data and fill the "all" store by commiting the "fill" mutation manually
            commit('fill', {stateName: 'all', payload: options.reader(response)})

            resolve()
          })
        })
      },

      /*
       * Create a new item by making a POST request to the endpoint
       */
      create ({commit}, item) {
        return new Promise((resolve, reject) => {
          axios.post(url, item, {params: options.params.create}).then(response => {
            // Here we dont commit any data as we prefer waiting the mutation
            // from the server through laravel-vuex

            resolve()
          })
        })
      },

      /*
       * Update an existing item by making a PUT request to the endpoint plus the item id
       */
      update ({commit}, item) {
        return new Promise((resolve, reject) => {
          axios.put(url + '/' + item.id, item, {params: options.params.update}).then(response => {
            // Here we dont commit any data as we prefer waiting the mutation
            // from the server through laravel-vuex

            resolve()
          })
        })
      },

      /*
       * Delete an existing item by making a DELETE request to the endpoint plus the item id
       */
      delete ({commit}, item) {
        return new Promise((resolve, reject) => {
          axios.delete(url + '/' + item.id, item, {params: options.params.delete}).then(response => {
            // Here we dont commit any data as we prefer waiting the mutation
            // from the server through laravel-vuex

            resolve()
          })
        })
      }
    }
  }
}
