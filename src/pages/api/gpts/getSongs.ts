import { type NextApiHandler } from 'next'
import { z } from 'zod'
import { Song } from '~/lib/state'
import { zpp } from '@cryop/zpp'
import { getSpotify } from '../spotify'
import { env } from '~/env.mjs'

export const getSongReqSchema = zpp(
  z.object({
    queries: z
      .array(z.string())
      .describe(
        'Search queries of song names/artists to get songs from spotify'
      ),
  })
)

export const songSchema: z.ZodType<Song> = zpp(
  z.object({
    uri: z.string().describe('Spotify URI of the song'),
    title: z.string().describe('Title of the song'),
    artist: z.string().describe('Artist of the song'),
    image: z.string().describe('Image of the song'),
  })
)

export const getSongResponseSchema = zpp(
  z.object({
    songs: z.array(songSchema),
  })
)

const handler: NextApiHandler = async (req, res) => {
  try {
    const spotify = getSpotify()

    const input = getSongReqSchema.jsonParseSafe(req.body)

    if (!input.success) {
      res.status(400).json({ error: 'Bad request' })
      return
    }

    console.log({ input })

    spotify.setAccessToken(env.SPOTIFY_MIXMATE_ACCESS_TOKEN)
    spotify.setRefreshToken(env.SPOTIFY_MIXMATE_REFRESH_TOKEN)

    const songs = await Promise.all(
      input.data.queries.map(async (query) => {
        const { body } = await spotify.searchTracks(query, { limit: 1 })
        return {
          uri: body.tracks?.items[0]?.uri,
          title: body.tracks?.items[0]?.name,
          artist: body.tracks?.items[0]?.artists[0]?.name,
          image: body.tracks?.items[0]?.album?.images[0]?.url,
        }
      })
    )

    res.status(200).json(getSongResponseSchema.parse({ songs }))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e })
  }
}

export default handler
