import { Store } from "vuex";
import { Functor } from "./functor";
import { JustTypes } from "./just";
import {
  getOptions,
  processOptions,
  setStore,
  SetupFunction,
  StoreModule,
  StoreParam
} from "./module-defs";
import { Ref } from "./ref";

/**
 * Filters modules out of a larger object.
 */
export type JustModules<T extends SetupFunction<any>> = JustTypes<
  ReturnType<T>,
  ModuleRef<any, any, any>
>;

/**
 * Extracts the module from the generated module information.
 */
export type ModuleExtract<T extends SetupFunction<P>, P> = {
  [key in keyof JustModules<T>]: JustModules<T>[key] extends ModuleRef<
    StoreParam<infer S, any>,
    any,
    any
  >
    ? S
    : never;
};

/**
 * Defines the function behavior in the constructor.
 *
 * @template S contains the value of the `self` variable.
 */
export interface InternalFunction<S> {
  (): S;
  <F extends (self: S) => any>(fn: F): ReturnType<F>;
}

/**
 * Represents a module reference, which will later be used to generate modules.
 */
export class ModuleRef<
  T extends StoreParam<F, P>,
  F extends SetupFunction<P>,
  P
> extends Functor<InternalFunction<ReturnType<T["setup"]>>>
  implements Ref<ReturnType<T["setup"]>> {
  public static create = <
    T extends StoreParam<F, P>,
    F extends SetupFunction<P>,
    P
  >(
    value: T,
    param?: P
  ): ModuleRef<T, F, P> & InternalFunction<ReturnType<T["setup"]>> =>
    new ModuleRef<T, F, P>(value, param) as any;

  /**
   * Contains the return type of the `setup` function, which defines the module.
   */
  public readonly value: ReturnType<T["setup"]>;

  /**
   * Differentiates this type from other ref types.
   */
  public readonly type = "modules";

  /**
   * Contains the value that is pushed back to the main process.
   */
  public readonly modules: StoreModule<T["setup"], P>;

  /**
   * Reference to the store this is attached to.
   */
  public store?: Store<any>;

  /**
   * Name of the store module.
   */
  public title?: string;

  /**
   * Contains a reference to the module that owns this reference.
   */
  private parentModule?: ModuleRef<any, any, any>;

  /**
   * The raw configuration value passed into the constructor.
   */
  private readonly raw?: T;

  constructor(value: T, param?: P) {
    super((fn: (arg: any) => any = (s: ReturnType<T["setup"]>) => s) =>
      fn(this.value)
    );
    this.raw = value;
    this.value = getOptions(this.raw, param);
    this.modules = processOptions(this.value);
    this.modules.namespaced = this.raw.namespaced;
  }

  /**
   * Override the store and variable name to read/write.
   *
   * @param store contains the production-version of the store.
   * @param title names the variable on the store.
   */
  public setStore(
    store: Store<any>,
    title: string,
    parentModule?: ModuleRef<any, any, any>
  ) {
    this.parentModule = parentModule;
    this.title = title;
    setStore(this.value, store, this);
  }

  /**
   * Retrieves the path to this module.
   */
  public getPath(): string[] {
    return this.getAncestors()
      .filter(mod => mod.modules.namespaced)
      .map(mod => mod.title || "")
      .filter(Boolean);
  }

  /**
   * Retrieves the list of ancestor modules that generated this one.
   */
  public getAncestors(): Array<ModuleRef<any, any, any>> {
    const result = this.parentModule ? this.parentModule.getAncestors() : [];
    if (this.title) {
      result.push(this);
    }
    return result;
  }

  public process(
    result: StoreModule<any, any>,
    key: string
  ): StoreModule<any, any> {
    result.modules[key] = this.modules;
    return result;
  }
}
