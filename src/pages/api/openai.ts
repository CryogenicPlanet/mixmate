/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type NextApiRequest, type NextApiResponse } from 'next'
import axios from 'axios'
import { env } from '~/env.mjs'
import { requestSchema } from '~/utils/data'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Set up axios instance with the necessary configuration

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const props = requestSchema.parse(JSON.parse(req.body))

  const openai = axios.create({
    baseURL: 'https://api.openai.com/v1/',
    headers: {
      Authorization: `Bearer ${env.OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  try {
    // Start streaming the chat completion
    const response = await openai({
      method: 'POST',
      url: '/chat/completions',
      data: {
        messages: props.messages,
        model: props.model,
        stream: true,
      },
      responseType: 'stream',
    })

    // Set up response headers
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Transfer-Encoding', 'chunked')

    // Pipe the response stream to the client
    response.data.pipe(res)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error streaming data:', error.message)
      res.status(500).json({ error: 'Error streaming data from OpenAI API' })
    }
  }
}

export default handler
