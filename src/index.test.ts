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
    const getFoo = getter(() => foo.value);
    const getFooFoo = getter(() => getFoo.value + getFoo.value);
    const SET_FOO = mutation((payload: { foo: string }) => {
      foo.value = payload.foo;
    });

    const bah = state("bah");
    const SET_BAH = mutation((payload: { bah: string }) => {
      bah.value = payload.bah;
    });

    const SET_FOO_AND_BAH = mutation(
      (payload: { foo: string; bah: string }) => {
        SET_BAH({ bah: payload.bah });
        SET_FOO({ foo: payload.foo });
      }
    );

    const actionSend = action(async (payload: string) => [payload, payload]);
    const secondTier = action(async (payload: string) => [
      ...(await actionSend(payload)),
      ...(await actionSend(payload))
    ]);

    return {
      foo,
      getFoo,
      getFooFoo,
      SET_FOO,

      bah,
      SET_BAH,

      SET_FOO_AND_BAH,

      // SET_FOO: mutation((payload: { foo: string }) => {
      //   foo.value = payload.foo;
      // }),
      actionSend,
      secondTier
      // myModule: module(myModule)
    };
  }
};

test("Can get the state from the store", () => {
  const $store = createStore(options);

  expect($store.state.foo).toEqual("bar");
});

test("Can use unexported state values", () => {
  const $state = state(0);

  expect($state.value).toEqual(0);

  $state.value++;

  expect($state.value).toEqual(1);
});

test("Can use mutations", () => {
  const $store = createStore(options);

  V.mutations($store).SET_FOO({ foo: "blahblahblah" });

  expect($store.state.foo).toEqual("blahblahblah");
});

test("Can use unexported mutations", () => {
  const $state = state(0);
  const $mutation = mutation((payload: number) => {
    $state.value = payload;
  });

  $mutation(1);

  expect($state.value).toEqual(1);
});

test("Can use getters", () => {
  const $store = createStore(options);

  expect($store.getters.getFoo).toEqual($store.state.foo);

  V.mutations($store).SET_FOO({ foo: "blahblahblah" });
  expect($store.getters.getFoo).toEqual($store.state.foo);
});

test("Can use unexported getters", () => {
  const $getter = getter(() => 1);

  expect($getter.value).toEqual(1);
});

test("Can use getters inside other getters", () => {
  const $store = createStore(options);

  expect($store.getters.getFooFoo).toEqual(
    $store.getters.getFoo + $store.getters.getFoo
  );
});

test("Can use mutations inside other mutations", () => {
  const $store = createStore(options);

  const mutations: string[] = [];
  $store.subscribe(m => {
    mutations.push(m.type);
  });

  V.mutations($store).SET_FOO_AND_BAH({ foo: "first", bah: "second" });

  expect($store.state.foo).toEqual("first");
  expect($store.state.bah).toEqual("second");

  // Reverse order, because events trigger when commits resolve.
  expect(mutations).toEqual(["SET_BAH", "SET_FOO", "SET_FOO_AND_BAH"]);
});

test("Can use actions", async () => {
  const $store = createStore(options);

  expect(await V.actions($store).actionSend("test")).toEqual(["test", "test"]);
});

test("Can use unexported actions", async () => {
  const $action = action(async () => 1);

  expect(await $action()).toEqual(1);
});

test("Can nest actions", async () => {
  const $store = createStore(options);

  const actions: string[] = [];
  $store.subscribeAction(a => {
    actions.push(a.type);
  });

  expect(await V.actions($store).secondTier("test")).toEqual([
    "test",
    "test",
    "test",
    "test"
  ]);

  expect(actions).toEqual(["secondTier", "actionSend", "actionSend"]);
});
// x.state;
// x.getters;
// x.mutations;
// x.actions;
// x.modules;
