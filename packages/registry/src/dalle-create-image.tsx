import { createAction, createActionMetadata } from "@energizeai/types"
import { OpenAI } from "openai"
import z from "zod"

const IMAGE_PROMPT_DESCRIPTION = `The prompt to use to generate the image. You must take the user's request and transform it into a much more descriptive prompt. 

### Example User Request:
make an image of a mama bear and her cubs

### Example Prompt:
A heartwarming scene of a mama bear with her adorable cubs in a forest setting. The mama bear, large and protective, is depicted with a soft, nurturing expression as she watches over her cubs. The cubs, fluffy and playful, are exploring the surroundings, with one cub trying to climb a tree and another playfully tugging at its mother's fur. The forest around them is lush and green, with tall trees and a carpet of ferns and wildflowers. The sunlight filters through the tree canopy, casting dappled shadows and highlighting the family in a serene, natural environment.

Required. Must be a non-empty string.`

const DalleCreateImageAction = createAction({
  metadata: createActionMetadata({
    title: "Create Image w/ DALL-E 3",
    description: "Create an image using DALL-E 3",
    resource: "OpenAI",
    avatar: {
      light: "/logos/openai-black.svg",
      dark: "/logos/openai-white.svg",
    },
    defaultKeywords: ["dalle-create-image"],
    apiReference:
      "https://platform.openai.com/docs/guides/images/image-generation?context=node",
    examples: [
      "make an image of a monkey playing the drums in a band",
      "show me what it would look like if an astronaut was playing basketball on the moon",
      "I'm imagining a cat with a mohawk",
    ],
  }),
})
  .setInputSchema(
    z
      .object({
        prompt: z.string().min(1).describe(IMAGE_PROMPT_DESCRIPTION),
        size: z
          .enum(["1024x1024", "1792x1024", "1024x1792"])
          .optional()
          .default("1024x1024")
          .describe(`The size of the generated images. Optional`),
        style: z
          .enum(["vivid", "natural"])
          .optional()
          .default("vivid")
          .describe(
            `Vivid causes the model to lean towards generating hyper-real and dramatic images. Natural causes the model to produce more natural, less hyper-real looking images.`
          ),
      })
      .describe(`Create an image using DALL-E 3.`)
  )
  .setOutputSchema(
    z.object({
      generatedImageUrl: z
        .string()
        .describe(`The public URL of the generated image.`),
    })
  )
  .setAuthType("Token")
  .setTokenData({
    humanReadableDescription: "Ability to generate images using DALL-E 3",
    humanReadableName: "OpenAI API Token",
    button: {
      text: "Continue with OpenAI",
    },
    generatingTokenReferenceURL:
      "https://platform.openai.com/docs/quickstart?context=python",
    customDataSchema: null,
  })
  .setActionFunction(async ({ input, auth, userData }) => {
    const openai = new OpenAI({
      apiKey: auth.accessToken,
    })
    const response = await openai.images.generate({
      ...input,
      model: "dall-e-3",
    })

    const imageUrl = response.data[0]?.url || null

    if (!imageUrl) {
      throw new Error("Could not generate image [1]")
    }

    return {
      generatedImageUrl: imageUrl,
    }
  })

export { DalleCreateImageAction }
