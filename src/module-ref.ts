import { JustTypes } from "./just";
import { Ref } from "./ref";

export type JustModules<O> = JustTypes<O, ModuleRef<any>>;

export type ModuleExtract<T> = T extends (...args: any[]) => infer D
  ? {
      [key in keyof JustModules<D>]: JustModules<D>[key] extends ModuleRef<
        infer R
      >
        ? R
        : never;
    }
  : never;

export class ModuleRef<T> implements Ref<T> {
  public static create = <T>(value: T) => new ModuleRef(value);

  public readonly value: T;
  public readonly type = "modules";
  public readonly _module: never;

  constructor(value: T) {
    this.value = value;
  }
}
