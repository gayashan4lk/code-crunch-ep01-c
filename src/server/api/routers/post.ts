import { z } from "zod";
import OpenAI from "openai";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

let post = {
  id: 1,
  name: "Hello World",
};

const openai = new OpenAI({
  apiKey: "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",
});

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      post = { id: post.id + 1, name: input.name };
      return post;
    }),

  getLatest: publicProcedure.query(() => {
    return post;
  }),

  chat: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      try {
        const completion = await openai.chat.completions.create({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
              role: "user",
              content:
                "Generate a simple speech topic based on below suggestions. 1.What is your favorite song and why? 2.Do you think shyness can be cured? ",
            },
          ],
          model: "gpt-3.5-turbo",
        });
        return completion.choices[0]?.message;
      } catch (error) {
        console.error("error:", error);
      }
    }),
});
