# Laravel Vuex (Client) - WIP

This is the Vuejs client package for [Laravel Vuex](https://github.com/Ifnot/laravel-vuex-php).

## Installation

    npm install -S laravel-vuex

### Configuration

#### Listen Echo events

Listen to your `public` channel for a `laravel.vuex:mutation` events and broadcast them to your store :

```js
Echo.channel('public')
  .listen('.laravel.vuex:mutation', (e) => {
    store.commit(e.namespace + '/' + e.mutation, {
    stateName: e.state,
    payload: e.payload
  })
});
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
