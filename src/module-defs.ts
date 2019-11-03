import { Store, StoreOptions as VSO } from "vuex";
import { ActionExtract, ActionRef } from "./action-ref";
import { GetterExtract, GetterRef } from "./getter-ref";
import { ModuleExtract, ModuleRef } from "./module-ref";
import { MutationExtract, MutationRef } from "./mutation-ref";
import { StateExtract, StateRef } from "./state-ref";

/**
 * Function definition for the options `setup()` method.
 */
export type SetupFunction = () => {
  [key: string]:
    | ActionRef<any>
    | GetterRef<any>
    | ModuleRef<any>
    | MutationRef<any>
    | StateRef<any>;
};

/**
 * Represents the store module output.
 *
 * @template T is the function that generated the options.
 */
export interface StoreModule<T extends SetupFunction> extends VSO<any> {
  namespaced?: boolean;
  state: StateExtract<T>;
  getters: GetterExtract<T>;
  mutations: MutationExtract<T>;
  actions: ActionExtract<T>;
  modules: {
    [key in keyof ModuleExtract<T>]: StoreModule<ModuleExtract<T>[key]>;
  };
}

/**
 * Defines the store options, used to generate a new store.
 *
 * @template T is a function that returns the configuration object.
 */
export interface StoreParam<T extends SetupFunction> {
  /**
   * On modules, this determines whether the content is on a sub-module.
   */
  namespaced?: boolean;

  /**
   * Function that generates the configuration object.
   */
  setup: T;
}

export function setStore<T extends SetupFunction>(
  opt: ReturnType<T>,
  store: Store<any>,
  parentModule?: ModuleRef<any>
) {
  Object.entries(opt).forEach(([key, value]) => {
    value.setStore(store, key, parentModule);
  });
}

/**
 * Executes the `obj.setup` function and returns the result with some typings.
 *
 * @param obj The object with a setup value.
 */
export function getOptions<T extends StoreParam<any>>(
  obj: T
): ReturnType<T["setup"]> {
  return obj.setup();
}

/**
 * Pre-processing the modules.
 *
 * @param options are the result from the `setup` function.
 */
export function processOptions<T extends SetupFunction>(
  options: ReturnType<T>
): StoreModule<T> {
  return Object.entries(options).reduce(
    (result: StoreModule<T>, [key, value]) => {
      return value.process(result, key);
    },
    {
      state: {},
      getters: {},
      mutations: {},
      actions: {},
      modules: {}
    }
  );
}
