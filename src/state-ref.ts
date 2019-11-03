import { Accessor } from "./accessor";
import { JustTypes } from "./just";
import { SetupFunction, StoreModule } from "./module-defs";
import { Ref } from "./ref";

/**
 * Extracts _only_ the keys that contain StateRef elements.
 *
 * @template O identifies the object to filter.
 */
type JustStates<T extends SetupFunction> = JustTypes<
  ReturnType<T>,
  StateRef<any>
>;

/**
 * Extracts all `StateRef` elements from `T`.
 *
 * @template T is the function that generates the value.
 */
export type StateExtract<T extends SetupFunction> = {
  [key in keyof JustStates<T>]: JustStates<T>[key] extends StateRef<infer R>
    ? R
    : never;
};

/**
 * Indirect reference for State entries.
 *
 * @template T provides type-hinting for the state entry.
 */
export class StateRef<T> extends Accessor<(val?: T) => T> implements Ref<T> {
  /**
   * Create an indirect reference for State entries.
   *
   * @template T provides type-hinting for the state entry.
   *
   * @param value is the initial value to set in the reference.
   */
  public static create = <T>(value: T): StateRef<T> & ((val?: T) => T) =>
    new StateRef(value) as any;

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

  constructor(value: T) {
    super((val?: T) => {
      if (val !== void 0) {
        this.value = val;
      }
      return this.value;
    });
    this.value = this.state = value;
  }

  public process(result: StoreModule<any>, key: string): StoreModule<any> {
    result.state[key] = this.state;
    return result;
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
