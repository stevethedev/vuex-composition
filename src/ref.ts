export const $value = Symbol();

/**
 * Standardizes the behavior of a reference.
 */
export interface Ref<T> {
  /**
   * Internally held value.
   */
  readonly value: T;
}
