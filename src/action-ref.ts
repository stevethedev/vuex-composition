import { Store } from "vuex";
import { JustTypes } from "./just";
import { Ref } from "./ref";

export type JustActions<O> = JustTypes<O, ActionRef<any, any>>;

export type ActionExtract<T> = T extends (...args: any[]) => infer A
  ? {
      [key in keyof JustActions<A>]: JustActions<A>[key] extends ActionRef<
        any,
        infer R
      >
        ? R
        : never;
    }
  : never;

export class ActionRef<R, T extends () => Promise<R>> implements Ref<T> {
  public static create = <R, T extends () => Promise<R>>(value: T) =>
    new ActionRef(value);

  public readonly value: T;
  public readonly type = "actions";
  public readonly _action: never;

  constructor(value: T) {
    this.value = value;
  }
}
