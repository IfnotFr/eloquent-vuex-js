# Eloquent Vuex (Client) - WIP

This is the vuejs client package for [Eloquent Vuex](https://github.com/Ifnot/eloquent-vuex-php).

## Installation

    npm install -S eloquent-vuex

## Quick start

Configure your laravel echo driver, and add the plugin into your vuex store :

```js
import cars from './modules/cars' // Import a example module used for the demo

import Echo from 'laravel-echo'
let echo = new Echo({ ... }) // Here working Echo configuration

// Create your vuex store using the plugin
let store = new Vuex.Store({
  plugins: [
    eloquentVuex.create({
      driver: new EchoDriver({
        echo,
        channels: [], // Public channels you want to listen
        privateChannels: [] // Private channels you want to listen
      })
    })
  ],
  modules: {
    cars // Here is our demo vuex module
  }
})
```

Create the demo vuex module into `./modules/cars.js` (it should be namespaced) :

```js
import Mutations from 'eloquent-vuex/store/mutations'

const state = {
  all: [] // A state is required for holding all the models (default is "all")
}

const getters = {
  all: state => state.all
}

const actions = {}

const mutations = {
  ...Mutations.get() // Append prebuilt mutations for handling eloquent mutations
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

```

Now the client has the minimum configuration for a `car` example module.

> For this example working, make sure your created a `Car` model on your server side (laravel project) and you are listening modifications with `Vuex::sync`.

## How it works

For each of your laravel models you should create a namespaced store module with the plural, snake case name of your class. When `eloquent-vuex` catch a mutation send from laravel through echo, the package will convert it to a mutation loaded by `Mutations.get()` into your module. This mutation will change the `all` state.
