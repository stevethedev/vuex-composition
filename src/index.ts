import Vuex from "vuex";
import V, { Store } from "vuex-functional";
import { ActionExtract, ActionRef } from "./action-ref";
import { GetterExtract, GetterRef } from "./getter-ref";
import { ModuleExtract, ModuleRef } from "./module-ref";
import { MutationExtract, MutationRef } from "./mutation-ref";
import { StateExtract, StateRef } from "./state-ref";

export const action = ActionRef.create;
export const getter = GetterRef.create;
export const module = ModuleRef.create;
export const mutation = MutationRef.create;
export const state = StateRef.create;

export type StateFunction = () => {
  [key: string]:
    | ActionRef<any>
    | GetterRef<any>
    | ModuleRef<unknown>
    | (MutationRef<any> & ((...args: any[]) => void))
    | StateRef<any>;
};

export interface StoreModule<T> {
  namespaced?: boolean;
  state: StateExtract<T>;
  getters: GetterExtract<T>;
  mutations: MutationExtract<T>;
  actions: ActionExtract<T>;
  modules: ModuleExtract<T>;
}

export interface StoreParam<T extends StateFunction> {
  namespaced?: boolean;
  setup: T;
}

type Options<T> = { [key in keyof T]?: T[key] };

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
  const { mod, opt } = processOptions(obj);
  const store = V.into<typeof mod>(new Vuex.Store(mod as any));

  Object.entries(opt).forEach(([key, value]) => {
    if ((value as any).setStore) {
      (value as any).setStore(store, key);
    }
  });

  return store;
}

function processOptions<
  T extends StateFunction,
  R extends ReturnType<StateFunction>
>(obj: StoreParam<T>): { mod: StoreModule<T>; opt: R } {
  const opt: R = obj.setup() as R;
  const mod = Object.entries(opt).reduce(
    (result: Options<StoreModule<T>>, [key, value]) => {
      if (!result[value.type]) {
        result[value.type] = {} as any;
      }

      (result as StoreModule<T>)[value.type][key] =
        value[value.type] || value.value;

      return result;
    },
    {}
  ) as StoreModule<T>;

  return { mod, opt };
}
