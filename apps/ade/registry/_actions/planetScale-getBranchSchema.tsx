import z from "zod"
import { createADEAction } from "../_properties/generators"

const PlanetScaleGetBranchTableSchema = z.object({
  name: z.string(),
  annotated: z.boolean(),
  raw: z.string(),
  html: z.string(),
})

function buildGetBranchSchemaEndpoint(customData: {
  serviceTokenId: string
  branchName: string
  database: string
  organization: string
}) {
  const endpoint = `https://api.planetscale.com/v1/organizations/${customData.organization}/databases/${customData.database}/branches/${customData.branchName}/schema`
  const url = new URL(endpoint)
  return url.toString()
}

const PlanetScaleGetBranchSchemaAction = createADEAction({
  id: "planetScale-getBranchSchema",
  metadata: {
    title: "Get a Branch Schema",
    description: "Get a branch schema from a PlanetScale database",
    resource: "PlanetScale",
    avatar: {
      light: "/logos/planetscale-black.svg",
      dark: "/logos/planetscale-white.svg",
    },
    defaultKeywords: ["planetscale-get-branch-schema"],
    apiReference:
      "https://api-docs.planetscale.com/reference/get-a-branch-schema",
    examples: ["what does my database schema look like?"],
  },
})
  .setInputSchema(
    z
      .object({
        filterTableNames: z
          .array(z.string().describe(`A table names to filter the schema by.`))
          .optional()
          .describe(
            `A list of table names to filter the schema by. Optional. Defaults to returning the schema for all tables.`
          ),
        page: z
          .number()
          .optional()
          .describe(
            `The page to fetch. Optional. Defaults to fetching the first page.`
          ),
      })
      .describe(`Get the schema for the current branch in PlanetScale.`)
  )
  .setActionType("SERVER")
  .setOutputSchema(
    z.object({
      rawTables: z.array(
        z.string().describe(`The raw MYSQL schema for a table.`)
      ),
      totalPages: z
        .number()
        .describe(
          `The total number of pages of tables the user has in their PlanetScale branch.`
        ),
    })
  )
  .setAuthType("Token")
  .setTokenData({
    humanReadableDescription:
      "Ability to read your branch schema on PlanetScale",
    humanReadableName: "PlanetScale API Token",
    button: {
      text: "Continue with PlanetScale",
    },
    generatingTokenReferenceURL:
      "https://api-docs.planetscale.com/reference/service-tokens",
    customDataSchema: z.object({
      serviceTokenId: z
        .string()
        .min(1)
        .describe("The ID of the service (access) token"),
      branchName: z.string().min(1).describe("The name of the branch"),
      database: z
        .string()
        .min(1)
        .describe("The name of the database the branch belongs to"),
      organization: z
        .string()
        .min(1)
        .describe("The name of the organization the branch belongs to"),
    }),
    validateToken: async ({ auth }) => {
      const endpoint = buildGetBranchSchemaEndpoint(auth.customData)
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `${auth.customData.serviceTokenId}:${auth.accessToken}`,
        },
      })

      if (!response.ok) {
        return { isValid: false }
      }

      const data = await response.json()

      return { isValid: true }
    },
  })
  .setActionFunction(async ({ input, auth }) => {
    const response = await fetch(
      buildGetBranchSchemaEndpoint(auth.customData),
      {
        headers: {
          Authorization: `${auth.customData.serviceTokenId}:${auth.accessToken}`,
        },
      }
    )

    const parsedJson = await response.json()
    const responseSchema = z.object({
      data: z.array(PlanetScaleGetBranchTableSchema),
    })

    let parsedTables = responseSchema.parse(parsedJson)

    if (input && input.filterTableNames && input.filterTableNames.length > 0) {
      const filteredTableNamesLowered = input.filterTableNames.map(
        (tableName) => tableName.toLowerCase()
      )
      parsedTables = {
        data: parsedTables.data.filter((table) =>
          filteredTableNamesLowered.includes(table.name.toLowerCase())
        ),
      }
    }

    const rawTables = parsedTables.data.map((table) => table.raw)

    const pageSize = 5
    const page = input.page || 1

    const paginatedTables = rawTables.slice(
      (page - 1) * pageSize,
      page * pageSize
    )
    const totalPages = Math.ceil(rawTables.length / pageSize)

    return {
      rawTables: paginatedTables,
      totalPages,
    }
  })

export { PlanetScaleGetBranchSchemaAction }
