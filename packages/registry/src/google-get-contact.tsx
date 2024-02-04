import { createAction, createActionMetadata } from "@energizeai/types"
import z from "zod"

const SearchContactsResponseSchema = z.object({
  results: z.array(
    z.object({
      person: z.record(z.any()),
    })
  ),
})

const outputSchema = z.object({
  displayName: z.string().nullable().describe(`The contact's display name.`),
  primaryEmailAddress: z
    .string()
    .nullable()
    .describe(`The contact's primary email address.`),
})

const GoogleGetContactAction = createAction({
  metadata: createActionMetadata({
    title: "Get Google Contact",
    description: "Query a Google Contact with the Google People API",
    resource: "Google",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["get-google-contact"],
    apiReference:
      "https://developers.google.com/people/api/rest/v1/people/searchContacts",
    examples: ["can you tell me what is the email address of ..."],
  }),
})
  .setInputSchema(
    z
      .object({
        query: z
          .string()
          .min(1)
          .describe(
            `The query matches on a single contact's names, nickNames, emailAddresses, phoneNumbers, and organizations. Can only match 1 person at a time.`
          ),
      })
      .describe(
        `Get a contact from the user's Google Contacts. This is useful to lookup someones email address if it wasn't already provided.`
      )
  )
  .setOutputSchema(outputSchema)
  .setAuthType("OAuth")
  .setOAuthData({
    humanReadableDescription: "Read-only access to your Google Contacts",
    humanReadableName: "Google Contacts",
    button: {
      text: "Continue with Google",
    },
    discoveryEndpoint:
      "https://accounts.google.com/.well-known/openid-configuration",
    scopes: [
      "https://www.googleapis.com/auth/contacts.other.readonly",
      "https://www.googleapis.com/auth/contacts.readonly",
    ],
    oauthAppGenerationURL: "https://console.cloud.google.com/apis/credentials",
  })
  .setActionFunction(async ({ input, auth, userData }) => {
    async function getOtherContact() {
      const base = "https://people.googleapis.com/v1/otherContacts:search"

      const headers = {
        Authorization: `Bearer ${auth.accessToken}`,
        Accept: "application/json",
      }

      const url = new URL(base)
      url.searchParams.append("pageSize", "1")
      url.searchParams.append("readMask", "names,emailAddresses,phoneNumbers")
      url.searchParams.append("query", input.query)

      const response = await fetch(url.toString(), {
        headers,
      })

      if (!response.ok) {
        throw new Error("Could not fetch contacts")
      }

      const data = await response.json()

      const parsedData = SearchContactsResponseSchema.safeParse(data)

      if (!parsedData.success || parsedData.data.results.length === 0) {
        throw new Error(
          `Could not find contact for ${input.query} in your Google contacts`
        )
      }

      const rawContact = parsedData.data.results[0]?.person || null

      if (!rawContact) {
        throw new Error(
          `Could not find contact for ${input.query} in your Google contacts`
        )
      }

      const contactParsed = outputSchema.parse({
        displayName: rawContact.names?.[0]?.displayName || null,
        primaryEmailAddress: rawContact.emailAddresses?.[0]?.value || null,
      })

      return contactParsed
    }

    // search contacts
    const base = "https://people.googleapis.com/v1/people:searchContacts"

    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
      Accept: "application/json",
    }

    const url = new URL(base)
    url.searchParams.append(
      "readMask",
      "names,emailAddresses,phoneNumbers,birthdays"
    )
    url.searchParams.append("pageSize", "1")
    url.searchParams.append("query", input.query)

    const response = await fetch(url.toString(), {
      headers,
    })

    if (!response.ok) {
      throw new Error("Could not fetch contacts")
    }

    const data = await response.json()

    const parsedData = SearchContactsResponseSchema.safeParse(data)

    // if no contacts found, search other contacts
    if (!parsedData.success || parsedData.data.results.length === 0) {
      return await getOtherContact()
    }

    const rawContact = parsedData.data.results[0]!.person

    const contactParsed = outputSchema.parse({
      displayName: rawContact.names?.[0]?.displayName || null,
      primaryEmailAddress: rawContact.emailAddresses?.[0]?.value || null,
    })

    return contactParsed
  })

export { GoogleGetContactAction }
