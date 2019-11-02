import { Store } from "vuex";
import { JustTypes } from "./just";
import { ModuleRef } from "./module-ref";
import { Ref } from "./ref";

/**
 * Extracts _only_ the keys that contain StateRef elements.
 *
 * @template O identifies the object to filter.
 */
type JustStates<O> = JustTypes<O, StateRef<any>>;

/**
 * Extracts all `StateRef` elements from `T`.
 *
 * @template T is the function that generates the value.
 */
export type StateExtract<T extends (...args: any[]) => any> = {
  [key in keyof JustStates<ReturnType<T>>]: JustStates<
    ReturnType<T>
  >[key] extends StateRef<infer R>
    ? R
    : never;
};

/**
 * Indirect reference for State entries.
 *
 * @template T provides type-hinting for the state entry.
 */
export class StateRef<T> implements Ref<T> {
  /**
   * Create an indirect reference for State entries.
   *
   * @template T provides type-hinting for the state entry.
   *
   * @param value is the initial value to set in the reference.
   */
  public static create = <T>(value: T) => new StateRef(value);

  /**
   * Retrieve the internally-held value. TODO: This isn't retrieving variables properly. Regardless of namespace, module data is at this.store.state.path.to.module.variable
   */
  public get value(): T {
    if (this.store && this.title) {
      const route = this.getGetterRoute();
      return route.reduce((s, p) => s[p], this.store.state)[this.title];
    }
    return this.state;
  }

  /**
   * Set the internally-held value.
   */
  public set value(val: T) {
    if (this.store && this.title) {
      const route = this.getGetterRoute();
      route.reduce((s, p) => s[p], this.store.state)[this.title] = val;
    }
    this.state = val;
  }

  /**
   * The type-identifier, used to sort into the State entry.
   */
  public readonly type = "state";

  /**
   * Placeholder state; does two things. Once the store is connected to the
   * pointer, this stops being used.
   */
  private state: T;

  /**
   * Reference to the store this is attached to.
   */
  private store?: Store<any>;

  /**
   * Name of the variable within the store.
   */
  private title?: string;

  /**
   * Contains a reference to the module that owns this reference.
   */
  private parentModule?: ModuleRef<any>;

  constructor(value: T) {
    this.value = this.state = value;
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
    parentModule?: ModuleRef<any>
  ) {
    this.store = store;
    this.title = title;
    this.parentModule = parentModule;
  }

  /**
   * Retrieves the routes that getters must traverse.
   */
  private getGetterRoute(): string[] {
    return this.parentModule
      ? this.parentModule
          .getAncestors()
          .map(ancestor => ancestor.title || "")
          .filter(Boolean)
      : [];
  }
}
