import V from "vuex-functional";
import { createStore, module, mutation, state, StoreOptions as CSO } from ".";

function getRootStore() {
  return V.into<CSO<typeof storeOptions>>(createStore(storeOptions));
}

const storeOptions = {
  setup: () => {
    // State
    const buildType = state(process.env.NODE_ENV || "");

    const installed = module(installedModule);

    return {
      buildType,

      installed
    };
  }
};

const installedModule = {
  namespaced: true,
  setup: () => {
    interface Payload {
      string: string;
      number: number;
    }

    const payloads = state<Payload[]>([]);

    const ADD = mutation((payload: Payload) => {
      payloads([...payloads.value, payload]);
    });

    const SET = mutation((payload: Payload[]) => {
      payloads.value = [...payload];
    });

    return {
      payloads,

      ADD,
      SET
    };
  }
};

test("Can access the base store", () => {
  const store = getRootStore();

  expect(typeof V.state(store).buildType).toBe("string");
  expect(typeof V.modules(store).installed).toBe("object");
});

test("Can access the module store", () => {
  const installed = V.modules(getRootStore()).installed;
  expect(installed.state.payloads).toEqual([]);
});
