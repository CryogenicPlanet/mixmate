import { z } from 'zod'

export const chatCompletionRequestMessageSchema = z.object({
  role: z.union([
    z.literal('system'),
    z.literal('user'),
    z.literal('assistant'),
  ]),
  content: z.string(),
  name: z.string().optional(),
})

export const requestSchema = z.object({
  messages: z.array(chatCompletionRequestMessageSchema),
  model: z.string().default('gpt-3.5-turbo'),
})

export const updateSchema = z
  .object({
    id: z.string(),
    object: z.string(),
    created: z.number(),
    model: z.string(),
    choices: z.array(
      z.object({
        delta: z.object({
          role: z.string().optional(),
          content: z.string().optional(),
        }),
        index: z.number(),
        finish_reason: z.string().or(z.null()),
      })
    ),
  })
  .deepPartial()
