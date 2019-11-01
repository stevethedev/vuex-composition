import { Store } from "vuex";
import { Functor } from "./functor";
import { JustTypes } from "./just";
import { ModuleRef } from "./module-ref";
import { Ref } from "./ref";

/**
 * Extracts _only_ the keys that contain `ActionRef` elements.
 *
 * @template O identifies the object to filter.
 */
export type JustActions<O> = JustTypes<O, ActionRef<any>>;

/**
 * Extracts all `ActionRef` elements from `T`.
 *
 * @template T is the function that generates the value.
 */
export type ActionExtract<T> = T extends (...args: any[]) => infer A
  ? {
      [key in keyof JustActions<A>]: JustActions<A>[key] extends ActionRef<
        infer R
      >
        ? (arg: any, payload: Payload<R>) => ReturnType<R>
        : (arg: any) => ReturnType<any>;
    }
  : never;

/**
 * Extracts the payload type from the target function.
 */
type Payload<T> = T extends (...args: any[]) => void
  ? Parameters<T>[0]
  : undefined;

/**
 * Indirect reference for Action entries.
 *
 * @template T defines the action function.
 */
export class ActionRef<T extends (payload: any) => Promise<any>>
  extends Functor<T>
  implements Ref<(arg: any, payload: Payload<T>) => Promise<ReturnType<T>>> {
  /**
   * Create an indirect reference for Action entries.
   *
   * @template T provides type-hinting for the action.
   *
   * @param value is the value to set in the reference.
   */
  public static create = <T extends (payload: any) => Promise<any>>(
    value: T
  ): T & ActionRef<T> => new ActionRef(value) as any;

  /**
   * Provides the action function.
   */
  public readonly value: T;

  /**
   * Helps to sort the action into the appropriate category.
   */
  public readonly type = "actions";

  /**
   * Contains the Vuex-facing action function.
   */
  public readonly actions: (arg: any, payload: Payload<T>) => Promise<any>;

  /**
   * Reference to the store this is attached to.
   */
  public store?: Store<any>;

  /**
   * Name of the variable within the store.
   */
  public title?: string;

  /**
   * The module that hosts this structure.
   */
  private parentModule?: ModuleRef<any>;

  constructor(value: T) {
    super((async payload => {
      const dispatch = this.getDispatchName();
      if (this.store && dispatch) {
        return this.store.dispatch(dispatch, payload);
      }
      return this.value(payload);
    }) as T);
    this.value = value;
    this.actions = (_arg0: any, payload: Payload<T>) => this.value(payload);
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
   * Retrieves the internal Dispatch name.
   */
  private getDispatchName(): string | null {
    if (this.store && this.title) {
      const path = this.parentModule
        ? this.parentModule.getPath().join("/")
        : null;
      return path ? `${path}/${this.title}` : this.title;
    }
    return null;
  }
}
