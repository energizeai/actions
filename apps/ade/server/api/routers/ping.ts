import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const pingRouter = createTRPCRouter({
  publicPing: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),
})
