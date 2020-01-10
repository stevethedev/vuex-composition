import { Accessor } from "./accessor";
import { getPath } from "./helpers";
import { JustTypes } from "./just";
import { SetupFunction, StoreModule } from "./module-defs";
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
export type GetterExtract<T extends SetupFunction<any>> = {
  [key in keyof JustGetters<ReturnType<T>>]: JustGetters<
    ReturnType<T>
  >[key] extends GetterRef<infer R>
    ? R
    : never;
};

/**
 * Indirect reference for Getter entries.
 *
 * @template T defines the getter-based function.
 */
export class GetterRef<T extends () => any>
  extends Accessor<() => ReturnType<T>>
  implements Ref<ReturnType<T>> {
  /**
   * Create an indirect reference for Getter entries.
   *
   * @template T provides type-hinting for the getter.
   *
   * @param value is the value to set in the reference.
   */
  public static create = <T extends () => any>(value: T): GetterRef<T> & T =>
    new GetterRef<T>(value) as any;

  /**
   * Executes the getter and retrieves the value.
   */
  public get value(): ReturnType<T> {
    if (this.store) {
      const getterPath = getPath(this.title, this.parentModule);
      if (getterPath) {
        return this.store.getters[getterPath];
      }
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

  constructor(value: T) {
    super(() => this.value);
    this.getters = value;
  }

  public process(result: StoreModule<any>, key: string): StoreModule<any> {
    result.getters[key] = this.getters;
    return result;
  }
}
