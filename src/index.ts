import Vuex, { Store } from "vuex";
import {
  getOptions,
  processOptions,
  setStore,
  SetupFunction,
  StoreModule,
  StoreParam
} from "./module-defs";

import { ActionRef } from "./action-ref";
import { GetterRef } from "./getter-ref";
import { ModuleRef } from "./module-ref";
import { MutationRef } from "./mutation-ref";
import { StateExtract, StateRef } from "./state-ref";

/**
 * Create an indirect reference for Action entries.
 *
 * @template T provides type-hinting for the action.
 *
 * @param value is the value to set in the reference.
 */
export const action = ActionRef.create;

/**
 * Create an indirect reference for Getter entries.
 *
 * @template T provides type-hinting for the getter.
 *
 * @param value is the value to set in the reference.
 */
export const getter = GetterRef.create;

/**
 * Create an indirect reference for Module entries.
 *
 * @template T provides type-hinting for the module.
 *
 * @param value is the value to set in the reference.
 */
export const module = ModuleRef.create;

/**
 * Create an indirect reference for Mutation entries.
 *
 * @template T provides type-hinting for the mutation.
 *
 * @param value is the value to set in the reference.
 */
export const mutation = MutationRef.create;

/**
 * Create an indirect reference for State entries.
 *
 * @template T provides type-hinting for the variable.
 *
 * @param value is the value to set in the reference.
 */
export const state = StateRef.create;

/**
 * Provides the typing information for Vuex-Functional to read types.
 */
export type StoreOptions<T extends StoreParam<any>> = StoreModule<T["setup"]>;

/**
 * Create a new Vuex store with the configuration options.
 *
 * @param obj provides the configuration options for creating the store.
 */
export const createStore = <T extends SetupFunction>(
  obj: StoreParam<T>
): Store<StateExtract<T>> => {
  const opt: ReturnType<T> = getOptions(obj);
  const mod: StoreModule<T> = processOptions(opt);
  const store = new Vuex.Store(mod);
  setStore(opt, store);

  return store;
};
