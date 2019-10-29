import { Store } from "vuex";
import { JustTypes } from "./just";
import { Ref } from "./ref";

export type JustGetters<O> = JustTypes<O, GetterRef<any, any>>;

export type GetterExtract<T> = T extends (...args: any[]) => infer G
  ? {
      [key in keyof JustGetters<G>]: JustGetters<G>[key] extends GetterRef<
        any,
        infer R
      >
        ? R
        : never;
    }
  : never;

export class GetterRef<R, T extends () => R> implements Ref<T> {
  public static create = <R, T extends () => R>(value: T) =>
    new GetterRef(value);

  public readonly value: T;
  public readonly type = "getters";
  public readonly _getter: never;

  constructor(value: T) {
    this.value = value;
  }
}
