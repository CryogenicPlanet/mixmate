import { zpp } from '@cryop/zpp'
import { type NextApiHandler } from 'next'
import { z } from 'zod'
import { getSpotify } from '../spotify'
import { env } from '~/env.mjs'

export const createPlaylistSchema = zpp(
  z.object({
    name: z.string().describe('Give the playlist a name'),
    songs: z
      .array(
        z.object({
          name: z.string().describe('The name of the song'),
          uri: z.string().describe('The Spotify URI of the song'),
        })
      )
      .describe("The playlist's songs"),
    operationId: z.string(),
  })
)

export const createPlaylistResponseSchema = zpp(
  z.object({
    playlistId: z.string().describe('The id of the playlist'),
    playlistUrl: z.string().describe('The url of the playlist'),
  })
)

const handler: NextApiHandler = async (req, res) => {
  const input = createPlaylistSchema.jsonParse(req.body)

  const spotify = getSpotify()

  spotify.setAccessToken(env.SPOTIFY_MIXMATE_ACCESS_TOKEN)
  spotify.setRefreshToken(env.SPOTIFY_MIXMATE_REFRESH_TOKEN)

  const playlist = await spotify.createPlaylist(
    input.name || `Mixmate Playlist ${new Date().toISOString()}`,
    {
      description: 'Created by Mixmate (https://chatg.pt/spotify)',
    }
  )

  await spotify.addTracksToPlaylist(
    playlist.body.id,
    input.songs.map((s) => s.uri)
  )

  res.status(200).json(
    createPlaylistResponseSchema.new({
      playlistId: playlist.body.id,
      playlistUrl: playlist.body.external_urls.spotify,
    })
  )
}

export default handler
