import { Store, createStore as createVuexStore } from "vuex";
import {
  setStore,
  SetupFunction,
  StoreModule,
  StoreParam
} from "./module-defs";

import { ActionRef } from "./action-ref";
import { GetterRef } from "./getter-ref";
import { Module, ModuleRef } from "./module-ref";
import { MutationRef } from "./mutation-ref";
import { StateExtract, StateRef } from "./state-ref";

export { Module, ActionRef, GetterRef, MutationRef, StateRef };

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
// eslint-disable-next-line @typescript-eslint/unbound-method
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
 * A convenience function that type-checks the store-creation.
 * 
 * @param options Options object to type-check.
 */
export function createOptions<T extends StoreParam<any>>(options: T): T {
  return options;
}

/**
 * Create a new Vuex store with the configuration options.
 *
 * @param obj provides the configuration options for creating the store.
 */
export function createStore<T extends StoreParam<SetupFunction<never>>>(
  obj: T
): Store<StateExtract<SetupFunction<never>>>;

export function createStore<T extends StoreParam<SetupFunction<any>>>(
  obj: T,
  param?: T extends StoreParam<SetupFunction<infer P>> ? P : never
): Store<StateExtract<T extends StoreParam<infer SP> ? SP : never>>;

export function createStore<T extends StoreParam<SetupFunction<any>>>(
  obj: T,
  param?: T extends StoreParam<SetupFunction<infer P>> ? P : never
): Store<StateExtract<T extends StoreParam<infer SP> ? SP : never>> {
  const storeModule = module(obj, param as any);
  const store = createVuexStore(storeModule.modules);
  setStore(storeModule.value, store);

  return store;
}
