import { type NextApiRequest, type NextApiResponse } from 'next'
import SpotifyWebApi from 'spotify-web-api-node'
import { env } from '~/env.mjs'
import { kv } from '@vercel/kv'

export const getBaseUrl = () => {
  return env.URL
}

export const REDIRECT_URI = `${getBaseUrl()}/api/callback`

export const getSpotify = () => {
  return new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
  })
}

export const getMixmateSpotify = async () => {
  const accessToken =
    (await kv.get<string>('mixmateAccessToken')) ||
    env.SPOTIFY_MIXMATE_ACCESS_TOKEN
  const refreshToken =
    (await kv.get<string>('mixmateRefreshToken')) ||
    env.SPOTIFY_MIXMATE_REFRESH_TOKEN
  const expiresAt = parseFloat(
    (await kv.get<string>('mixmateExpiresAt')) || '0'
  )

  const spotify = getSpotify()

  spotify.setAccessToken(accessToken)
  spotify.setRefreshToken(refreshToken)

  if (expiresAt < Date.now()) {
    const { body } = await spotify.refreshAccessToken()
    const accessToken = body.access_token
    const expiresIn = body.expires_in

    spotify.setAccessToken(accessToken)

    await kv.set('mixmateAccessToken', accessToken)
    await kv.set('mixmateExpiresAt', Date.now() + expiresIn * 1000)
  }

  return spotify
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
