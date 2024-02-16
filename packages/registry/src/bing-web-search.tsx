import { newId } from "@energizeai/shared"
import { createAction, createActionMetadata } from "@energizeai/types"
import dedent from "dedent"
import z from "zod"

const BingWebPagesResultSchema = z.object({
  webPages: z.object({
    webSearchUrl: z.string(),
    totalEstimatedMatches: z.number(),
    value: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        snippet: z.string(),
        url: z.string(),
      })
    ),
  }),
})

const BingImageSchema = z
  .object({
    thumbnail: z
      .object({
        contentUrl: z.string(),
        width: z.number(),
        height: z.number(),
      })
      .nullish(),
  })
  .nullish()

const BingNewsResultSchema = z.object({
  _type: z.literal("News"),
  readLink: z.string(),
  totalEstimatedMatches: z.number(),
  value: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      description: z.string().nullable(),
      datePublished: z.string(),
      image: BingImageSchema,
    })
  ),
})

const BingPlacesResultSchema = z.object({
  places: z.object({
    value: z.array(
      z.object({
        _type: z.string(),
        id: z.string(),
        name: z.string(),
        url: z.string(),
        telephone: z.string(),
        image: BingImageSchema,
        address: z
          .object({
            addressLocality: z.string().nullish(),
            addressRegion: z.string().nullish(),
            postalCode: z.string().nullish(),
            streetAddress: z.string().nullish(),
            neighborhood: z.string().nullish(),
          })
          .nullish(),
      })
    ),
  }),
})

const BingWebSearchOutput = z.object({
  sources: z.array(
    z.object({
      title: z.string().describe("The title of the search result"),
      url: z.string().describe("The URL of the search result"),
      id: z.string().describe("The ID of the search result"),
      snippet: z
        .string()
        .nullable()
        .describe("The snippet of the search result"),
      primaryImageOfPage: z
        .object({
          thumbnailUrl: z.string(),
          width: z.number(),
          height: z.number(),
        })
        .nullish()
        .describe("The primary image of the search result"),
    })
  ),
})

const BingWebSearchAction = createAction({
  id: "bing-webSearch",
  metadata: createActionMetadata({
    title: "Bing Web Search",
    description: "Search the web using Bing",
    resource: "Bing",
    avatar: {
      light: "/logos/bing.svg",
      dark: "/logos/bing.svg",
    },
    defaultKeywords: ["bing-web-search"],
    apiReference:
      "https://learn.microsoft.com/en-us/bing/search-apis/bing-news-search/reference/query-parameters",
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
        answerCount: z
          .number()
          .optional()
          .default(8)
          .describe(
            `The number of search results to return. Optional. Defaults to 8.`
          ),
        responseFilter: z
          .enum(["Webpages", "News", "Places"])
          .optional()
          .default("Webpages")
          .describe(
            `The type of results to return. Optional. Defaults to Webpages.`
          ),
        category: z
          .enum([
            "Business",
            "Entertainment",
            "Health",
            "Politics",
            "Products",
            "ScienceAndTechnology",
            "Sports",
            "US",
            "World",
          ])
          .optional()
          .describe(
            "The category of news articles to return. Optional. Defaults to all categories. Only used when responseFilter is News."
          ),
      })
      .describe(`Browse the web using Bing.`)
  )
  .setOutputSchema(BingWebSearchOutput)
  .setAuthType("Token")
  .setTokenData({
    humanReadableDescription:
      "Ability to search the web using Bing Web Search API v7",
    humanReadableName: "Bing Web Search",
    button: {
      text: "Continue with Bing",
    },
    generatingTokenReferenceURL:
      "https://learn.microsoft.com/en-us/bing/search-apis/bing-web-search/create-bing-search-service-resource",
    customDataSchema: null,
  })

  // ==========================================================================
  // Define the action function
  // ==========================================================================

  .setActionFunction(async ({ input, auth, userData }) => {
    const { query, responseFilter, answerCount, category } = input

    const BING_SEARCH_ENDPOINT = "https://api.bing.microsoft.com/v7.0"

    const endpoint =
      responseFilter === "News"
        ? BING_SEARCH_ENDPOINT + "/news/search"
        : BING_SEARCH_ENDPOINT + "/search"

    const url = new URL(endpoint)
    const params: Record<string, string> = {
      q: query,
      answerCount: answerCount.toString(),
      mkt: "en-US",
      count: answerCount.toString(),
      offset: "0",
      responseFilter,
    }

    if (responseFilter === "News" && category !== undefined) {
      params.category = category
      params.sortBy = "Relevance"
    }

    url.search = new URLSearchParams(params).toString()

    const response = await fetch(url.toString(), {
      headers: {
        "Ocp-Apim-Subscription-Key": auth.accessToken,
      },
    })

    const json = await response.json()

    const webPagesSafe = BingWebPagesResultSchema.safeParse(json)
    const placesSafe = BingPlacesResultSchema.safeParse(json)
    const newsSafe = BingNewsResultSchema.safeParse(json)

    type Base = {
      url: string
      name: string
      id: string
      snippet: string | null
      image?: z.infer<typeof BingNewsResultSchema>["value"][number]["image"]
    }

    type TSource = z.infer<typeof BingWebSearchOutput>["sources"][number]
    const createSourceFromValue = async (value: Base): Promise<TSource> => {
      const source: TSource = {
        title: value.name,
        url: value.url,
        id: value.id,
        snippet: value.snippet || value.name,
        primaryImageOfPage:
          value.image && value.image.thumbnail
            ? {
                thumbnailUrl: value.image.thumbnail.contentUrl,
                width: value.image.thumbnail.width,
                height: value.image.thumbnail.height,
              }
            : undefined,
      }

      return source
    }

    const joined: Base[] = []

    // add in web pages
    if (webPagesSafe.success) {
      joined.push(...webPagesSafe.data.webPages.value)
    }

    // add in places
    if (placesSafe.success) {
      joined.push(
        ...placesSafe.data.places.value.map((v) => ({
          ...v,
          snippet: dedent`
      Name: ${v.name}, Address: ${JSON.stringify(v.address)}, Tel: ${
        v.telephone
      }
      `,
        }))
      )
    }

    // add in news
    const id = newId()
    if (newsSafe.success) {
      joined.push(
        ...newsSafe.data.value.map((v, ix) => ({
          ...v,
          id: `${id}-${ix}`,
          snippet: v.description,
        }))
      )
    }

    const sources = await Promise.all(joined.map(createSourceFromValue))

    return {
      sources,
    }
  })

export { BingWebSearchAction }
