import { type NextApiRequest, type NextApiResponse } from 'next'
import { getSpotify } from './spotify'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.query.code

  const spotify = getSpotify()

  const data = await spotify.authorizationCodeGrant(code as string)

  const url = new URL(`http://localhost:3000/`)

  url.searchParams.append('spotifyToken', data.body.access_token)
  url.searchParams.append('spotifyRefreshToken', data.body.refresh_token)

  res.redirect(url.toString())
}

export default handler
