# Laravel Vuex (Client) - WIP

This is the Vuejs client package for [Laravel Vuex](https://github.com/Ifnot/laravel-vuex-php).

## Installation

    npm install -S laravel-vuex

### Configuration

#### Bring Echo events to your Stores

Use the built-in `StoreCommiter` for a quick start :

```js
// Prepare your echo configuration
import Echo from 'laravel-echo'
let echo = new Echo({ ... })

// Load your vuex store object (in my example i just put it inside a ./store.js)
import store from './store'

// Set the channels you want to use (by default "public")
let channels = ['public']

// Map the events with the StoreCommiter
import StoreCommiter from 'laravel-vuex/store-commiter'
Vue.use(StoreCommiter, { echo, channels, stor })
```

#### Configure Vuex

For each of your laravel models you should create a corresponding store module with the plural, snake case name of your class. Below the examples corresponding to the [server-side example](https://github.com/Ifnot/laravel-vuex-php).

##### Main store :

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import cars from './modules/cars'

export default new Vuex.Store({
  modules: {
    cars
  }
})
```

##### `cars` store odule :

```js
import EventMutations from 'laravel-vuex/mutations/event-mutations'

const state = {
  all: []
}

const getters = {
  all: state => state.all
}

const actions = {}

const mutations = EventMutations.get()

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

```

### Example

Take a look at the [Laravel Vuex Js Example](https://github.com/Ifnot/laravel-vuex-js-example).
