import { Accessor, Payload } from "./accessor";
import { FunctorExecutor } from "./functor";
import { getPath } from "./helpers";
import { JustTypes } from "./just";
import { SetupFunction, StoreModule } from "./module-defs";
import { Ref } from "./ref";

/**
 * Extracts _only_ the keys that contain `MutationRef` elements.
 *
 * @template O identifies the object to filter.
 */
type JustMutations<T extends (...args: any[]) => any> = JustTypes<
  ReturnType<T>,
  MutationRef<any>
>;

/**
 * Extracts all `MutationRef` elements from `T`.
 *
 * @template T is the function that generates the value.
 */
export type MutationExtract<T extends SetupFunction> = {
  [key in keyof JustMutations<T>]: JustMutations<T>[key] extends MutationRef<
    infer F
  >
    ? StoreMutation<F>
    : never;
};

type Mutation = ((payload: any) => void) | (() => void);
type StoreMutation<M extends Mutation> = M extends () => void
  ? (arg: any) => void
  : (arg: any, payload: Payload<M>) => void;

/**
 * Indirect reference for Mutation entries.
 *
 * @template T defines the mutation function.
 */
export class MutationRef<T extends Mutation> extends Accessor<T>
  implements Ref<(arg: any, payload: Payload<T>) => void> {
  /**
   * Create an indirect reference for Mutation entries.
   *
   * @template T provides type-hinting for the mutation.
   *
   * @param value is the value to set in the reference.
   */
  public static create = <T extends Mutation>(
    value: T
  ): MutationRef<T> & FunctorExecutor<MutationRef<T>> =>
    new MutationRef<T>(value) as any;

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
  public readonly mutations: StoreMutation<T>;

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
    this.mutations = ((_arg0: any, payload: Payload<T>) =>
      this.value(payload)) as any;
  }

  public process(result: StoreModule<any>, key: string): StoreModule<any> {
    result.mutations[key] = this.mutations;
    return result;
  }
}
