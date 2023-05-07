import { type NextApiRequest, type NextApiResponse } from 'next'
import SpotifyWebApi from 'spotify-web-api-node'
import { env } from '~/env.mjs'

export const baseUrl = `https://mixmate.vercel.app`

export const REDIRECT_URI = `${baseUrl}/api/callback`

export const getSpotify = () => {
  return new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
  })
}

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

  const spotify = getSpotify()

  const url = spotify.createAuthorizeURL(
    [
      'user-read-private',
      'user-read-email',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-library-read',
      'user-library-modify',
      'playlist-modify-public',
      'playlist-modify-private',
    ],
    'state'
  )

  // Redirect to Spotify login page

  res.redirect(url)
}

export default handler
