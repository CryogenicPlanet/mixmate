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
})
