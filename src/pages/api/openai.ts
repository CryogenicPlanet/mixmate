import type { NextRequest } from 'next/server'
import { Configuration, OpenAIApi } from 'openai-edge'
import { env } from '~/env.mjs'
import { requestSchema } from '~/utils/data'

const configuration = new Configuration({
  apiKey: env.OPENAI_KEY,
})
const openai = new OpenAIApi(configuration)

const handler = async (req: NextRequest) => {
  const props = requestSchema.parse(await req.json())

  try {
    const completion = await openai.createChatCompletion({
      ...props,
      stream: true,
    })

    return new Response(completion.body, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error(error)

    return new Response(JSON.stringify(error), {
      status: 400,
      headers: {
        'content-type': 'application/json',
      },
    })
  }
}

export const config = {
  runtime: 'edge',
}

export default handler
