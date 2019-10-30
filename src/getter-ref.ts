import { Store } from "vuex";
import { JustTypes } from "./just";
import { Ref } from "./ref";

/**
 * Extracts _only_ the keys that contain `GetterRef` elements.
 *
 * @template O identifies the object to filter.
 */
type JustGetters<O> = JustTypes<O, GetterRef<any>>;

/**
 * Extracts all `GetterRef` elements from `T`.
 *
 * @template T is the function that generates the value.
 */
export type GetterExtract<T> = T extends (...args: any[]) => infer G
  ? {
      [key in keyof JustGetters<G>]: JustGetters<G>[key] extends GetterRef<
        infer R
      >
        ? R
        : never;
    }
  : never;

/**
 * Indirect reference for Getter entries.
 *
 * @template T defines the getter-based function.
 */
export class GetterRef<T extends () => any> implements Ref<ReturnType<T>> {
  /**
   * Create an indirect reference for Getter entries.
   *
   * @template T provides type-hinting for the getter.
   *
   * @param value is the value to set in the reference.
   */
  public static create = <T extends () => any>(value: T) =>
    new GetterRef(value);

  /**
   * Executes the getter and retrieves the value.
   */
  public get value(): ReturnType<T> {
    if (this.store && this.title) {
      return this.store.getters[this.title];
    }
    return this.getters();
  }

  /**
   * Helps to sort the getter into the appropriate category.
   */
  public readonly type = "getters";

  /**
   * Contains the raw getter value.
   */
  public readonly getters: T;

  /**
   * Reference to the store this is attached to.
   */
  private store?: Store<any>;

  /**
   * Name of the variable within the store.
   */
  private title?: string;

  constructor(value: T) {
    this.getters = value;
  }

  /**
   * Override the store and variable name to read/write.
   *
   * @param store contains the production-version of the store.
   * @param title names the variable on the store.
   */
  public setStore(store: Store<any>, title: string) {
    this.store = store;
    this.title = title;
  }
}
