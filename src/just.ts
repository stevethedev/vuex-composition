export type JustTypedKeys<O, T> = ({
  [P in keyof O]: O[P] extends T ? P : never;
})[keyof O];

export type JustTypes<O, T> = Pick<O, JustTypedKeys<O, T>>;
