import { Store } from "vuex-functional";
import { ActionExtract, ActionRef } from "./action-ref";
import { GetterExtract, GetterRef } from "./getter-ref";
import { ModuleExtract, ModuleRef } from "./module-ref";
import { MutationExtract, MutationRef } from "./mutation-ref";
import { StateExtract, StateRef } from "./state-ref";

/**
 * Function definition for the options `setup()` method.
 */
export type StateFunction = () => {
  [key: string]:
    | ActionRef<any>
    | GetterRef<any>
    | ModuleRef<any, any>
    | MutationRef<any>
    | StateRef<any>;
};

/**
 * Represents the store module output.
 *
 * @template T is the function that generated the options.
 */
export interface StoreModule<T> {
  namespaced?: boolean;
  state: StateExtract<T>;
  getters: GetterExtract<T>;
  mutations: MutationExtract<T>;
  actions: ActionExtract<T>;
  modules: ModuleExtract<T>;
}

/**
 * Defines the store options, used to generate a new store.
 *
 * @template T is a function that returns the configuration object.
 */
export interface StoreParam<T extends StateFunction> {
  /**
   * On modules, this determines whether the content is on a sub-module.
   */
  namespaced?: boolean;

  /**
   * Function that generates the configuration object.
   */
  setup: T;
}

/**
 * Marks all of the keys in `T` as optional.
 *
 * @template T is an object to make the keys optional.
 */
type Options<T> = { [key in keyof T]?: T[key] };

export function setStore<T extends StateFunction>(
  opt: ReturnType<T>,
  store: Store<any>,
  path: string
) {
  Object.entries(opt).forEach(([key, value]) => {
    if ((value as any).setStore) {
      console.log(path, "-", key, "-", value);
      (value as any).setStore(store, key, path);
    }
  });
}

export function getOptions<T extends StateFunction>(
  obj: StoreParam<T>
): ReturnType<T> {
  return obj.setup() as any;
}

export function processOptions<T extends ReturnType<StateFunction>>(
  options: T
): StoreModule<T> {
  return Object.entries(options).reduce(
    (result: Options<StoreModule<T>>, [key, value]) => {
      if (!result[value.type]) {
        result[value.type] = {} as any;
      }

      (result as StoreModule<T>)[value.type][key] =
        value[value.type] || value.value;

      return result;
    },
    {}
  ) as any;
}
