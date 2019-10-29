import { Store } from "vuex";
import { JustTypes } from "./just";
import { Ref } from "./ref";

export type JustStates<O> = JustTypes<O, StateRef<any>>;

export type StateExtract<T> = T extends (...args: any[]) => infer G
  ? {
      [key in keyof JustStates<G>]: JustStates<G>[key] extends StateRef<infer R>
        ? R
        : never;
    }
  : never;

export class StateRef<T> implements Ref<T> {
  public static create = <T>(value: T) => new StateRef(value);

  public get value(): T {
    if (this.store && this.title) {
      return this.store[this.title];
    }
    return this.state;
  }

  public set value(val: T) {
    if (this.store && this.title) {
      this.store[this.title] = val;
    }
    this.state = val;
  }

  public readonly type = "state";
  private state: T;

  private store?: Store<any>;
  private title?: string;

  constructor(value: T) {
    this.value = this.state = value;
  }

  public setStore(store: Store<any>, title: string) {
    this.store = store;
    this.title = title;

    Object.defineProperty(this, "value", {
      get: () => {
        if (this.store && this.title) {
          return this.store.state[this.title];
        }
      },
      set: () => {
        if (this.store && this.title) {
          return this.store.state[this.title];
        }
      }
    });
  }
}
