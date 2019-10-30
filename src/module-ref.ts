import { Store } from "vuex";
import { Functor } from "./functor";
import { JustTypes } from "./just";
import {
  getOptions,
  processOptions,
  setStore,
  StateFunction,
  StoreModule,
  StoreParam
} from "./module.defs";
import { Ref } from "./ref";

export type JustModules<O> = JustTypes<O, ModuleRef<any, any>>;

export type ModuleExtract<T> = T extends (...args: any[]) => infer D
  ? {
      [key in keyof JustModules<D>]: JustModules<D>[key] extends ModuleRef<
        any,
        infer R
      >
        ? R
        : never;
    }
  : never;

type InternalFunction<S, R = S> = (fn?: (self: S) => R) => R;

export class ModuleRef<S extends StateFunction, T extends StoreParam<S>>
  extends Functor<InternalFunction<ReturnType<S>, any>>
  implements Ref<StoreModule<ReturnType<S>>> {
  public static create = <S extends StateFunction, T extends StoreParam<S>>(
    value: T
  ): InternalFunction<ReturnType<S>, any> & ModuleRef<S, T> =>
    new ModuleRef(value) as any;

  public readonly value: StoreModule<ReturnType<S>>;
  public readonly type = "modules";
  public readonly modules: ReturnType<S>;

  /**
   * Reference to the store this is attached to.
   */
  public store?: Store<any>;

  /**
   * Name of the variable within the store.
   */
  public title?: string;

  private raw: T;

  constructor(value: T) {
    super((fn = self => self) => fn(this.modules));
    this.raw = value;
    this.modules = getOptions(this.raw);
    this.value = processOptions(this.modules);
  }

  /**
   * Override the store and variable name to read/write.
   *
   * @param store contains the production-version of the store.
   * @param title names the variable on the store.
   */
  public setStore(store: Store<any>, title: string, path: string = "") {
    setStore(
      this.modules,
      store,
      this.raw.namespaced ? ("" === path ? title : `${path}/${title}`) : path
    );
  }
}
