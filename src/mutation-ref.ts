import { Store } from "vuex";
import { Functor } from "./functor";
import { getPath } from "./helpers";
import { JustTypes } from "./just";
import { ModuleRef } from "./module-ref";
import { Ref } from "./ref";

/**
 * Extracts _only_ the keys that contain `MutationRef` elements.
 *
 * @template O identifies the object to filter.
 */
export type JustMutations<O> = JustTypes<O, MutationRef<any>>;

/**
 * Extracts all `MutationRef` elements from `T`.
 *
 * @template T is the function that generates the value.
 */
export type MutationExtract<T extends (...args: any[]) => any> = {
  [key in keyof JustMutations<ReturnType<T>>]: JustMutations<
    ReturnType<T>
  >[key] extends MutationRef<infer R>
    ? (arg: any, payload: Payload<R>) => void
    : (arg: any) => void;
};

/**
 * Extracts the payload type from the target function.
 */
type Payload<T> = T extends (...args: any[]) => void
  ? Parameters<T>[0]
  : undefined;

/**
 * Indirect reference for Mutation entries.
 *
 * @template T defines the mutation function.
 */
export class MutationRef<T extends (payload: any) => void> extends Functor<T>
  implements Ref<(arg: any, payload: Payload<T>) => void> {
  /**
   * Create an indirect reference for Mutation entries.
   *
   * @template T provides type-hinting for the mutation.
   *
   * @param value is the value to set in the reference.
   */
  public static create = <T extends (payload: any) => void>(
    value: T
  ): MutationRef<T> & T => new MutationRef(value) as any;

  /**
   * Provides the mutation function.
   */
  public readonly value: T;

  /**
   * Helps to sort the mutation into the appropriate category.
   */
  public readonly type = "mutations";

  /**
   * Contains the Vuex-facing mutation function.
   */
  public readonly mutations: (arg: any, payload: Payload<T>) => void;

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
  private parentModule?: ModuleRef<any>;

  constructor(value: T) {
    super((payload => {
      if (this.store) {
        const commitName = getPath(this.title, this.parentModule);
        if (commitName) {
          return this.store.commit(commitName, payload);
        }
      }
      return this.value(payload);
    }) as T);
    this.value = value;
    this.mutations = (_arg0: any, payload: Payload<T>) => this.value(payload);
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
}
