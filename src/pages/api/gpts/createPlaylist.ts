import { zpp } from '@cryop/zpp'
import { type NextApiHandler } from 'next'
import { z } from 'zod'
import { getMixmateSpotify } from '../spotify'
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
  })
)

export const createPlaylistResponseSchema = zpp(
  z.object({
    playlistId: z.string().describe('The id of the playlist'),
    playlistUrl: z.string().describe('The url of the playlist'),
  })
)

const handler: NextApiHandler = async (req, res) => {
  try {
    const input = createPlaylistSchema.jsonParseSafe(req.body)

    if (!input.success) {
      res.status(400).json({ error: 'Data did not pass schema validation' })
      return
    }

    const { data } = input

    const spotify = await getMixmateSpotify()

    const playlist = await spotify.createPlaylist(
      data.name || `Mixmate Playlist ${new Date().toISOString()}`,
      {
        description: 'Created by Mixmate (https://chatg.pt/spotify)',
      }
    )

    await spotify.addTracksToPlaylist(
      playlist.body.id,
      data.songs.map((s) => s.uri)
    )

    res.status(200).json(
      createPlaylistResponseSchema.new({
        playlistId: playlist.body.id,
        playlistUrl: playlist.body.external_urls.spotify,
      })
    )
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e })
  }
}

export default handler
