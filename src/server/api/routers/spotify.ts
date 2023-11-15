import { z } from 'zod'
import { getSpotify } from '~/pages/api/spotify'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const spotifyRouter = createTRPCRouter({
  refresh: publicProcedure
    .input(z.object({ access: z.string(), refresh: z.string() }))
    .query(({ input }) => {
      const spotify = getSpotify()

      spotify.setAccessToken(input.access)
      spotify.setRefreshToken(input.refresh)

      return spotify.refreshAccessToken()
    }),
  createPlaylist: publicProcedure
    .input(
      z.object({
        access: z.string(),
        refresh: z.string(),
        name: z.string(),
        songs: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const spotify = getSpotify()

      spotify.setAccessToken(input.access)
      spotify.setRefreshToken(input.refresh)

      console.log({ input })

      const playlist = await spotify.createPlaylist(
        input.name || `Mixmate Playlist ${new Date().toISOString()}`,
        {
          description: 'Created by Mixmate (https://chatgp.t/spotify)',
        }
      )

      await spotify.addTracksToPlaylist(playlist.body.id, input.songs)

      return playlist
    }),
})
