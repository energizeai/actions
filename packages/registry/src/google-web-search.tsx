import { createAction, createActionMetadata } from "ai-actions"
import z from "zod"

const GoogleWebSearchResponseSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      snippet: z.string(),
      pagemap: z
        .object({
          cse_thumbnail: z
            .array(
              z.object({
                src: z.string(),
                width: z.string(),
                height: z.string(),
              })
            )
            .nullish(),
        })
        .nullish(),
    })
  ),
})

const GoogleWebSearchAction = createAction({
  id: "google-webSearch",
  metadata: createActionMetadata({
    title: "Google Web Search",
    description: "Search the web using Google",
    resource: "Google",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["google-web-search"],
    apiReference: "https://developers.google.com/custom-search/v1/using_rest",
    examples: [
      "What's the latest news on the coronavirus?",
      "What are the top headlines?",
      "Did the Lakers win their last game?",
    ],
  }),
})
  .setInputSchema(
    z
      .object({
        query: z
          .string()
          .min(1)
          .describe(
            `The query to search for. You may rewrite the user's query to make it more specific and increase the likelihood that the browser will find what the user is looking for.`
          ),
      })
      .describe(`Browse the web using Google.`)
  )
  .setActionType("GET")
  .setOutputSchema(GoogleWebSearchResponseSchema)
  .setAuthType("Token")
  .setTokenData({
    humanReadableDescription:
      "Ability to search the web using Google Custom Search",
    humanReadableName: "Google Custom Search",
    button: {
      text: "Continue with Google",
    },
    generatingTokenReferenceURL:
      "https://developers.google.com/custom-search/v1/introduction",
    customDataSchema: z.object({
      cx: z
        .string()
        .describe("The custom search engine ID to use for this request"),
    }),
  })
  .setActionFunction(async ({ input, auth, userData }) => {
    const { query } = input

    const url = new URL("https://www.googleapis.com/customsearch/v1")
    const params = {
      q: query,
      cx: auth.customData.cx,
      key: auth.accessToken,
      lr: "lang_en",
      num: "8",
    }
    url.search = new URLSearchParams(params).toString()

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error("Could not fetch results")
    }

    const data = await response.json()
    const searchResults = GoogleWebSearchResponseSchema.parse(data)

    return searchResults
  })

export { GoogleWebSearchAction }
