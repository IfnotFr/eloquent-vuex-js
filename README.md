# Eloquent Vuex (Client) - WIP

This is the client side package for [Eloquent Vuex](https://github.com/Ifnot/eloquent-vuex-php).

## Prerequisites

> Before using this package you should have a working Echo installation (client + server). [Please follow the official installation steps from the documentation](https://laravel.com/docs/5.5/broadcasting). You have to be able to send a ping from laravel and read it with Echo.

## Installation

Install with npm :

    npm install -S eloquent-vuex

Setup it into your `main.js`, you should instanciate all components like to following :

```
// Load vuex store (we assume your installation is into the /store folder)
import store from './store'

// Setup your Laravel Echo
import Echo from 'laravel-echo'
window.Echo = new Echo({
    // ...
})

// Now register eloquent vuex
import { eloquentVuex } from 'eloquent-vuex'
Vue.use(eloquentVuex, { echo, store })
```

## Configuration

### Stores

Here we assume that you are using one vuex module for one eloquent model (please refer to the [Official Vuex Cart Example](https://github.com/vuejs/vuex/tree/dev/examples/shopping-cart)). For small apps you can avoid modules and use a single store containing all your eloquent models.

```
- store/
    - index.js
    - modules/
        - users.js
        - cars.js
```

In `users.js` and `cars.js` you need at least one state and have to append mutations built-in mutations :

```js

import Mutations from 'eloquent-vuex/store/mutations'

const state = {
  all: []
}

const mutations = {
  ...Mutations.get() // We are using the ES6 spread operator for merging this object with Mutations.get()
}

export default {
  state,
  mutations,
  // ...
}
```

### Collections
