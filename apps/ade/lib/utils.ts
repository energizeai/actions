export const LETTERS_LOWER = "abcdefghijklmnopqrstuvwxyz"
export const LETTERS_UPPER = LETTERS_LOWER.toUpperCase()
export const NUMBERS = Array.from(Array(1000).keys()).join("")

export const dashCase = (str: string) =>
  str.replace(/([A-Z])/g, (g) => `-${g[0]!.toLowerCase()}`)
