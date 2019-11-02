import { Store } from "vuex";
import { Functor } from "./functor";
import { ModuleRef } from "./module-ref";

export abstract class Accessor<T extends (...args: any) => any> extends Functor<
  T
> {
  /**
   * Reference to the store this is attached to.
   */
  public store?: Store<any>;

  /**
   * Name of the variable within the store.
   */
  public title?: string;

  /**
   * Contains a reference to the module that owns this reference.
   */
  protected parentModule?: ModuleRef<any>;

  /**
   * Override the store and variable name to read/write.
   *
   * @param store contains the production-version of the store.
   * @param title names the variable on the store.
   */
  public setStore(
    store: Store<any>,
    title: string,
    parentModule?: ModuleRef<any>
  ) {
    this.store = store;
    this.title = title;
    this.parentModule = parentModule;
  }
}
