export type ValuesOf<T> = T[keyof T]

export type FilterObjectByValue<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}
