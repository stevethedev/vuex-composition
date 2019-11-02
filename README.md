# Vuex Composer

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/cbcf0e3eb3104da18df94bf45520663f)](https://www.codacy.com/manual/stevethedev/vuex-composition?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=stevethedev/vuex-composition&amp;utm_campaign=Badge_Grade)
[![CodeFactor](https://www.codefactor.io/repository/github/stevethedev/vuex-composition/badge)](https://www.codefactor.io/repository/github/stevethedev/vuex-composition)
[![Snyk](https://img.shields.io/snyk/vulnerabilities/github/stevethedev/vuex-composition)](https://img.shields.io/snyk/vulnerabilities/github/stevethedev/vuex-composition)


This TypeScript library provides a Composition API-like interface for creating a Vuex store out of smaller parts. The goal of this project is to provide low-overhead and zero-configuration for composing Vuex stores.

## Browser Support

This library should work in any modern browser that supports JavaScript.

## Installation

```bash
npm i -S vuex-composer
```

## Usage

```typescript
import { createStore, module, action, getter, mutation, state } from "vuex-composer";

const $store = createStore({
  setup() {

    /*
     |-------------------------------------------------------------------------
     | State Values
     |-------------------------------------------------------------------------
     |
     | Creating a State value is pretty straightforward. Use the `state()`
     | function to create a reference object. You can access the value
     | by either using `.value` or by executing the returned functor.
     |
     */
    const number = state(0);

    number.value = 3
    number.value; // 3

    number(); // 3
    number(7); // 7
    number(); // 7

    number.value; // 7

    /*
     |-------------------------------------------------------------------------
     | Getters
     |-------------------------------------------------------------------------
     |
     | Creating a Getter is also pretty straightforward; use the same format
     | you would use with a Vanilla Vuex Getter, but omit the first param.
     |
     |
     */

    const getDollars(() => `$${number().toFixed(2)}`); // $7.00

    /*
     |-------------------------------------------------------------------------
     | Mutations and Actions
     |-------------------------------------------------------------------------
     |
     | Mutations and Actions, like Getters, are defined by providing a function
     | without the first parameter.
     |
     */

    const SET_DOLLARS = (payload: { number: number }) => {
      number(payload.number);
    };

    const sendDollars = (payload: { number: number }) => new Promise(resolve => {
      setTimeout(() => resolve(SET_DOLLARS(payload)), 500));
    });

    /*
     |-------------------------------------------------------------------------
     | Modules
     |-------------------------------------------------------------------------
     |
     | Modules take the same format as the store, but also accept a boolean
     | for `namespaced`, just like a normal Vuex module would.
     |
     */

    const myModule = module({
      namespaced: true,
      setup() {
        return {
          // Can access the variables from the root store or other modules.
          getPennies: getter(() => ((number() * 100) | 0))
        };
      }
    });

    // Module values can also be accessed from other module sor the root store.
    console.log(myModule(self => self.getPennies())); // 700

    /*
     |-------------------------------------------------------------------------
     | Output to Store
     |-------------------------------------------------------------------------
     |
     | Return all of the values you want to create in the store with the names
     | you want the Vuex store to use. They will be automatically converted
     | into the proper Store format.
     |
     */

    return { getDollars, number, sendDollars, SET_DOLLARS, myModule };
  }
});

$store.state.number; // 7
$store.getters.getDollars; // "$7.00"
$store.commit("SET_DOLLARS", { number: 12.34 }); // void
$store.dispatch("sendDollars", { number: 43.21 }); // Promise

$store.getters["myModule/getPennies"]; // 1234
```
