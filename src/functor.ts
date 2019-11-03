export class Functor<T> {
  constructor(proto: T) {
    return Object.setPrototypeOf(proto, new.target.prototype);
  }
}
