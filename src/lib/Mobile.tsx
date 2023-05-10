/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @next/next/no-img-element */
import { SongElement, SpotifyIcon } from '~/pages'
import { Chat } from './Chat'
import { useStore } from './state'
import SpotifyPlayer from 'react-spotify-web-playback'
import colors from 'tailwindcss/colors'
import { apiClient } from '~/utils/api'
import Link from 'next/link'

export const Mobile = () => {
  const songs = useStore((state) => state.songs)

  const currentSong = useStore((state) => state.currentSong)

  const hasSpotifyAccess = useStore((state) => !!state.spotifyToken.access)

  return (
    <div className="flex h-screen max-h-screen w-full flex-col justify-end bg-slate-900">
      <div className="flex flex-col py-2">
        <div className="flex items-center">
          <img src="/logo.png" alt="logo" className="h-16 w-16"></img>
          <div className="flex flex-col">
            <p className="text-2xl text-gray-100">Mixmate</p>
            <p className="text-xs text-gray-300">
              Talk to GPT and get a mixtape back
            </p>
          </div>
        </div>
      </div>

      {!hasSpotifyAccess ? (
        <div className="flex h-full w-full items-center justify-center">
          <Link
            href="/api/spotify"
            className="flex w-full max-w-xl items-center space-x-2 p-4"
          >
            <SpotifyIcon className="h-24 w-24 text-green-500" />
            <p className="text-xl text-gray-200">Login with Spotify</p>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex h-full w-full flex-1 items-center justify-center overflow-scroll px-0">
            <div className="grid  w-full grid-cols-2 overflow-y-scroll py-8 ">
              {songs.map((song) => (
                <SongElement key={song.uri} song={song} />
              ))}
            </div>
          </div>
          {currentSong && (
            <div className="mt-2 w-full border-t border-slate-500/30 px-2">
              <SpotifyPlayer
                token={useStore.getState().spotifyToken.access}
                getOAuthToken={async (callback) => {
                  const { access, expires_at, refresh } =
                    useStore.getState().spotifyToken

                  const now = new Date().getTime()
                  const expiry = new Date(expires_at).getTime()

                  if (now > expiry) {
                    const data = await apiClient.spotify.refresh.query({
                      refresh: refresh,
                      access: access,
                    })

                    const newDate = new Date()
                    newDate.setSeconds(
                      newDate.getSeconds() + data.body.expires_in
                    )

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
            </div>
          )}
          <div className="bg-slate-900 py-2">
            <Chat></Chat>
          </div>
        </>
      )}
    </div>
  )
}
