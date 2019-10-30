import Vuex from "vuex";
import V, { Store } from "vuex-functional";
import {
  getOptions,
  processOptions,
  setStore,
  StateFunction,
  StoreModule,
  StoreParam
} from "./module.defs";

import { ActionRef } from "./action-ref";
import { GetterRef } from "./getter-ref";
import { ModuleRef } from "./module-ref";
import { MutationRef } from "./mutation-ref";
import { StateRef } from "./state-ref";

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

// export function createModule<T>(obj: StoreParam<T>): StoreModule<T> {
//   return Object.entries(obj.setup()).reduce(
//     (result: Options<StoreModule<T>>, [key, value]) => {
//       if (!result[value.type]) {
//         result[value.type] = {} as any;
//       }

//       (result as StoreModule<T>)[value.type][key] = value.value;

//       return result;
//     },
//     {}
//   ) as StoreModule<T>;
// }

export function createStore<T extends StateFunction>(
  obj: StoreParam<T>
): Store<StoreModule<T>> {
  const opt = getOptions(obj);
  const mod = processOptions(opt);
  const store = V.into<StoreModule<T>>(new Vuex.Store(mod as any));
  setStore(opt, store, "");

  return store;
}
