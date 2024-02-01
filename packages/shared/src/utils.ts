// import { format, utcToZonedTime } from "date-fns-tz";
import { customAlphabet } from "nanoid"

export function convertToTimezone(input: {
  date: Date
  timezone: string
}): string {
  console.log({ input })
  // const { date, timezone } = input;
  // const zonedDate = utcToZonedTime(date, timezone);

  // // The format 'yyyy-MM-dd\'T\'HH:mm:ssXXX' will output the date in ISO format with timezone offset
  // return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone });
  return "hello world"
}

export function getDayOfWeekInTimeZone(input: {
  date: Date
  timezone: string
}): string {
  console.log({ input })
  // const { date, timezone } = input;
  // const zonedDate = utcToZonedTime(date, timezone);

  // return format(zonedDate, "EEEE", { timeZone: timezone });

  return "Monday"
}

export const generateDayTimeReference = (localTimeZone: string) => {
  const date = new Date()
  const timezone = localTimeZone

  const currentTimeRFC3339 = convertToTimezone({
    date,
    timezone,
  })
  const dayOfWeek = getDayOfWeekInTimeZone({
    date,
    timezone,
  })

  return `For reference, the current day is ${dayOfWeek}, the current time is ${currentTimeRFC3339}, the local timezone is ${timezone}.`
}

const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
)
export function newId(len: number = 16): string {
  return nanoid(len)
}
