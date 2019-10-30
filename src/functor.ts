export class Functor<T extends (...args: any[]) => any> {
  constructor(proto: T) {
    return Object.setPrototypeOf(proto, new.target.prototype);
  }
}
