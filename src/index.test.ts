import Vue from "vue";
import Vuex from "vuex";
// tslint-ignore-next-line
import V from "vuex-functional";
import {
  action,
  // createModule,
  createStore,
  getter,
  // module,
  mutation,
  state
} from ".";

Vue.use(Vuex);

const options = {
  setup: () => {
    // const myModule = createModule({
    //   namespaced: true,
    //   setup: () => {
    //     const bar = state("bar");
    //     return {
    //       getBar: getter(() => bar.value)
    //     };
    //   }
    // });

    const foo = state("bar");
    const bah = state("bah");

    return {
      foo,
      bah,
      getFoo: getter(() => foo.value),
      SET_FOO: mutation((payload: { foo: string }) => {
        foo.value = payload.foo;
      }),
      // SET_FOO: mutation((payload: { foo: string }) => {
      //   foo.value = payload.foo;
      // }),
      actionSend: action(async () => ["blah", "blah"])
      // myModule: module(myModule)
    };
  }
};

test("Can get the state from the store", () => {
  const $store = createStore(options);

  expect($store.state.foo).toEqual("bar");
});

test("Can use mutations", () => {
  const $store = createStore(options);

  V.mutations($store).SET_FOO({ foo: "blahblahblah" });

  expect($store.state.foo).toEqual("blahblahblah");
});
// x.state;
// x.getters;
// x.mutations;
// x.actions;
// x.modules;
