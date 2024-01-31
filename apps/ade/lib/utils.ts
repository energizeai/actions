export const LETTERS_LOWER = "abcdefghijklmnopqrstuvwxyz"
export const LETTERS_UPPER = LETTERS_LOWER.toUpperCase()
export const NUMBERS = Array.from(Array(1000).keys()).join("")

export const dashCase = (str: string) =>
  str.replace(/([A-Z])/g, (g) => `-${g[0]!.toLowerCase()}`)

export const toTitleCase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const camelCaseToTitleCase = (str: string) => {
  // take a camel case string like generateImageUrl and return Generate Image Url
  const words = str.split(/(?=[A-Z])/)
  return words
    .map((word) => toTitleCase(word))
    .join(" ")
    .replaceAll("_", " ")
}

export function base64Encode(str: string): string {
  return Buffer.from(str, "utf-8").toString("base64")
}

export function base64Decode(base64Str: string): string {
  return Buffer.from(base64Str, "base64").toString("utf-8")
}
