import { type NextApiRequest, type NextApiResponse } from 'next'
import { getBaseUrl, getSpotify } from './spotify'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.query.code

  const spotify = getSpotify()

  const data = await spotify.authorizationCodeGrant(code as string)

  const url = new URL(getBaseUrl())

  url.searchParams.append('spotifyToken', data.body.access_token)
  url.searchParams.append('spotifyRefreshToken', data.body.refresh_token)
  url.searchParams.append('spotifyExpiresIn', data.body.expires_in.toString())

  res.redirect(url.toString())
}

export default handler
