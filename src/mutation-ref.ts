import { Store } from "vuex";
import { JustTypes } from "./just";
import { Ref } from "./ref";

export type JustMutations<O> = JustTypes<O, MutationRef<any>>;

export type MutationExtract<T> = T extends (...args: any[]) => infer M
  ? {
      [key in keyof JustMutations<M>]: JustMutations<
        M
      >[key] extends MutationRef<infer R>
        ? (arg: any, payload: Payload<R>) => void
        : (arg: any) => void;
    }
  : never;

type Payload<T> = T extends (...args: any[]) => void
  ? Parameters<T>[0]
  : undefined;

export class MutationRef<T extends (payload: any) => void>
  implements Ref<(arg: any, payload: Payload<T>) => void> {
  public static create = <T extends (payload: any) => void>(value: T) =>
    new MutationRef(value);

  public readonly value: (arg: any, payload: Payload<T>) => void;
  public readonly type = "mutations";
  public readonly _mutation: never;

  constructor(value: T) {
    this.value = (_arg, payload) => value(payload);
  }
}
