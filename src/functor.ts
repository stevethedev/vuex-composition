export type FunctorExecutor<T extends Functor<any>> = T extends Functor<infer F>
  ? (...args: Parameters<F>) => ReturnType<F>
  : never;

export class Functor<T extends (...args: any[]) => any> {
  constructor(proto: T) {
    return Object.setPrototypeOf(proto, new.target.prototype);
  }
}
