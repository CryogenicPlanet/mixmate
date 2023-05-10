import SpotifyPlayer from 'react-spotify-web-playback'
import { apiClient } from '~/utils/api'
import colors from 'tailwindcss/colors'
import { useStore } from './state'

export const SpotifyPlayerWrapper = () => {
  const currentSong = useStore((state) => state.currentSong)

  if (!currentSong) return null

  return (
    <SpotifyPlayer
      token={useStore.getState().spotifyToken.access}
      getOAuthToken={async (callback) => {
        const { access, expires_at, refresh } = useStore.getState().spotifyToken

        const now = new Date().getTime()
        const expiry = new Date(expires_at).getTime()

        if (now > expiry) {
          const data = await apiClient.spotify.refresh.query({
            refresh: refresh,
            access: access,
          })

          const newDate = new Date()
          newDate.setSeconds(newDate.getSeconds() + data.body.expires_in)

          useStore.getState().setSpotifyToken({
            access: data.body.access_token,
            refresh:
              data.body.refresh_token ||
              useStore.getState().spotifyToken.refresh,
            expires_at: newDate.toISOString(),
          })

          callback(data.body.access_token)
        }

        callback(access)
      }}
      uris={[currentSong.uri]}
      initialVolume={0.5}
      callback={(state) => console.log(state)}
      styles={{
        activeColor: '#fff',
        bgColor: colors.slate[900],
        color: '#fff',
        loaderColor: '#fff',
        sliderColor: '#1cb954',
        trackArtistColor: '#ccc',
        trackNameColor: '#fff',
        sliderHandleColor: colors.green[500],
      }}
    />
  )
}
