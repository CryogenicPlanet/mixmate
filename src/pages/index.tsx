import { useEffect } from 'react'
import Head from 'next/head'
import { Layout } from '~/lib/Layout'
import {
  type Song,
  useStore,
  getSongInfo,
  SPOTIFY_ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY,
  SPOTIFY_EXPIRES_AT_LOCAL_STORAGE_KEY,
} from '~/lib/state'
import Link from 'next/link'

import clsx from 'clsx'
import { useRouter } from 'next/router'

import SpotifyPlayer from 'react-spotify-web-playback'
import colors from 'tailwindcss/colors'
import { CreatePlaylist } from '~/lib/CreatePlaylist'

import { isMobile } from 'react-device-detect'
import Mobile from './mobile'

function PlayPauseIcon({
  playing,
  ...props
}: { playing: boolean } & JSX.IntrinsicElements['svg']) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" fill="none" {...props}>
      {playing ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.496 0a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H2.68a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H1.496Zm5.82 0a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H8.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H7.316Z"
        />
      ) : (
        <path d="M8.25 4.567a.5.5 0 0 1 0 .866l-7.5 4.33A.5.5 0 0 1 0 9.33V.67A.5.5 0 0 1 .75.237l7.5 4.33Z" />
      )}
    </svg>
  )
}

export function SongElement({ song }: { song: Song }) {
  return (
    <div className="py-4">
      <div className={clsx('lg:px-8')}>
        <div className="lg:max-w-4xl">
          <div className="mx-auto px-2 sm:px-2 md:max-w-2xl md:px-2 lg:px-0">
            <div className="flex flex-col items-center sm:flex-row sm:space-x-2">
              <div className="flex flex-col items-center justify-center sm:flex-row">
                {/*  eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={song.image}
                  alt="Album Art"
                  className="h-auto w-20 sm:w-36"
                />
              </div>
              <div className="flex flex-col items-start px-4">
                <h2 className="mt-2 text-sm font-semibold text-slate-200 sm:text-lg sm:font-bold">
                  <p>{song.title}</p>
                </h2>

                <p className="mt-1 text-xs leading-7 text-slate-400 sm:text-base">
                  {song.artist}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      useStore.getState().setCurrentSong(song)
                    }}
                    className="flex items-center text-sm font-bold leading-6 text-pink-500 hover:text-pink-700 active:text-pink-900"
                  >
                    <PlayPauseIcon
                      playing={false}
                      className="h-2.5 w-2.5 fill-current"
                    />
                    <span className="ml-3" aria-hidden="true">
                      Listen
                    </span>
                  </button>
                  <span
                    aria-hidden="true"
                    className="text-sm font-bold text-slate-400"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()

  // useEffect: Get the openai key from local storage
  useEffect(() => {
    const spotifyAccessToken = window.localStorage.getItem(
      SPOTIFY_ACCESS_TOKEN_LOCAL_STORAGE_KEY
    )
    const spotifyRefreshToken = window.localStorage.getItem(
      SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY
    )

    const spotifyExpiresAt = window.localStorage.getItem(
      SPOTIFY_EXPIRES_AT_LOCAL_STORAGE_KEY
    )

    if (spotifyAccessToken && spotifyRefreshToken && spotifyExpiresAt) {
      useStore.getState().setSpotifyToken({
        access: spotifyAccessToken,
        refresh: spotifyRefreshToken,
        expires_at: spotifyExpiresAt,
      })
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.getSongInfo = getSongInfo
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.state = useStore
  }, [])

  const { spotifyRefreshToken, spotifyToken, spotifyExpiresIn } = router.query

  useEffect(() => {
    if (!spotifyRefreshToken || !spotifyToken || !spotifyExpiresIn) return

    window.localStorage.setItem(
      SPOTIFY_ACCESS_TOKEN_LOCAL_STORAGE_KEY,
      spotifyToken as string
    )

    const newDate = new Date()
    newDate.setSeconds(newDate.getSeconds() + Number(spotifyExpiresIn))

    window.localStorage.setItem(
      SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY,
      spotifyRefreshToken as string
    )

    window.localStorage.setItem(
      SPOTIFY_EXPIRES_AT_LOCAL_STORAGE_KEY,
      newDate.toISOString()
    )

    useStore.getState().setSpotifyToken({
      access: spotifyToken as string,
      refresh: spotifyRefreshToken as string,
      expires_at: newDate.toISOString(),
    })

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push('/', '/', { shallow: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyRefreshToken, spotifyToken])

  const hasSpotifyAccess = useStore((state) => !!state.spotifyToken.access)

  const songs = useStore((state) => state.songs)

  const currentSong = useStore((state) => state.currentSong)

  if (isMobile) {
    return <Mobile></Mobile>
  }

  return (
    <Layout>
      <Head>
        <title>Mixmate</title>
        <meta
          name="description"
          content="Mixmate is a tool to help you create playlists with chatgpt."
        />
      </Head>
      <div className="h-full pt-1 sm:pt-18">
        {hasSpotifyAccess ? (
          <>
            <div className={'hidden sm:block lg:px-8'}>
              <div className="lg:max-w-4xl">
                <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
                  <h1 className="text-2xl font-bold leading-7 text-slate-900">
                    Songs
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex h-full max-h-[40vh] flex-col justify-end sm:max-h-[90vh]">
              <div className="grid flex-1  grid-cols-2 divide-x divide-slate-500/10 overflow-scroll py-8">
                {songs.map((song) => (
                  <SongElement key={song.uri} song={song} />
                ))}
              </div>
              <div className="hidden w-full grid-cols-12 sm:grid">
                <div className="col-span-10">
                  {currentSong && (
                    <SpotifyPlayer
                      token={useStore.getState().spotifyToken.access}
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
                  )}
                </div>
                <div className="col-span-2 hidden items-center justify-end px-4 sm:flex">
                  <CreatePlaylist></CreatePlaylist>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <Link
              href="/api/spotify"
              className="flex w-full max-w-xs items-center space-x-2 p-4"
            >
              <SpotifyIcon className="h-24 w-24 text-green-500" />
              <p className="text-xl text-gray-200">Login with Spotify</p>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}

export function SpotifyIcon(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" {...props}>
      <path
        fill="currentColor"
        d="M15.8 3a12.8 12.8 0 1 0 0 25.6 12.8 12.8 0 0 0 0-25.6Zm5.87 18.461a.8.8 0 0 1-1.097.266c-3.006-1.837-6.787-2.252-11.244-1.234a.796.796 0 1 1-.355-1.555c4.875-1.115 9.058-.635 12.432 1.427a.8.8 0 0 1 .265 1.096Zm1.565-3.485a.999.999 0 0 1-1.371.33c-3.44-2.116-8.685-2.728-12.755-1.493a1 1 0 0 1-.58-1.91c4.65-1.41 10.428-.726 14.378 1.7a1 1 0 0 1 .33 1.375l-.002-.002Zm.137-3.629c-4.127-2.45-10.933-2.675-14.871-1.478a1.196 1.196 0 1 1-.695-2.291c4.52-1.374 12.037-1.107 16.785 1.711a1.197 1.197 0 1 1-1.221 2.06"
      />
    </svg>
  )
}
