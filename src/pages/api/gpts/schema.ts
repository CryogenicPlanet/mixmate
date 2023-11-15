import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { NextApiHandler } from 'next'
import { getSongReqSchema, songSchema } from './getSongs'
import {
  createPlaylistResponseSchema,
  createPlaylistSchema,
} from './createPlaylist'
import { z } from 'zod'

const handler: NextApiHandler = async (req, res) => {
  const registry = new OpenAPIRegistry()

  registry.registerPath({
    method: 'post',
    path: '/api/gpts/getSongs',
    operationId: 'GetSpotifySongsDetails',
    'x-openai-isConsequential': false,
    description:
      'Get songs details from spotify using queries of song titles/artists, required for creating a playlist',
    request: {
      body: {
        content: {
          'application/json': {
            schema: getSongReqSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Songs details',
        content: {
          'application/json': {
            schema: z.object({
              songs: z.array(songSchema),
            }),
          },
        },
      },
      500: {
        description: 'Internal server error',
      },
    },
  })
  registry.registerPath({
    method: 'post',
    operationId: 'CreatePlaylist',
    path: '/api/gpts/createPlaylist',
    'x-openai-isConsequential': false,
    description:
      'Create a playlist from spotify song uris, get uris from GetSpotifySongsDetails',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createPlaylistSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Playlist details',
        content: {
          'application/json': {
            schema: createPlaylistResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
      },
    },
  })

  const generator = new OpenApiGeneratorV3(registry.definitions)

  const json = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Mixmate Spotify Connect API',
    },
    servers: [
      {
        url: 'https://mixmate.vercel.app',
      },
    ],
  })

  res.status(200).json(json)
}

export default handler
