import { type FormEvent, useEffect, useState } from 'react'
import Head from 'next/head'
import { Layout } from '~/lib/Layout'
import {
  OPENAI_LOCAL_STORAGE_KEY,
  type Song,
  useStore,
  getSongInfo,
  SPOTIFY_ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY,
} from '~/lib/state'
import clsx from 'clsx'
import { useRouter } from 'next/router'

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

function SongElement({ song }: { song: Song }) {
  // const date = new Date(episode.published)

  // const audioPlayerData = useMemo(
  //   () => ({
  //     title: episode.title,
  //     audio: {
  //       src: episode.audio.src,
  //       type: episode.audio.type,
  //     },
  //     link: `/${episode.id}`,
  //   }),
  //   [episode]
  // )
  // const player = useAudioPlayer(audioPlayerData)

  return (
    <div className="py-4">
      <div className={clsx('lg:px-8')}>
        <div className="lg:max-w-4xl">
          <div className="mx-auto px-2 sm:px-2 md:max-w-2xl md:px-2 lg:px-0">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center">
                <img src={song.image} alt="" className="h-36 w-auto" />
              </div>
              <div className="flex flex-col items-start px-4">
                <h2
                  // id={`episode-${episode.id}-title`}
                  className="mt-2 text-lg font-bold text-slate-200"
                >
                  <p>{song.title}</p>
                </h2>

                {/* <FormattedDate
            date={date}
            className="order-first font-mono text-sm leading-7 text-slate-500"
          /> */}
                <p className="mt-1 text-base leading-7 text-slate-400">
                  {song.artist}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    type="button"
                    // onClick={() => player.toggle()}
                    className="flex items-center text-sm font-bold leading-6 text-pink-500 hover:text-pink-700 active:text-pink-900"
                    // aria-label={`${player.playing ? 'Pause' : 'Play'} episode ${
                    //   episode.title
                    // }`}
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
    const openAIKey = window.localStorage.getItem(OPENAI_LOCAL_STORAGE_KEY)
    const spotifyAccessToken = window.localStorage.getItem(
      SPOTIFY_ACCESS_TOKEN_LOCAL_STORAGE_KEY
    )
    const spotifyRefreshToken = window.localStorage.getItem(
      SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY
    )

    if (openAIKey) {
      useStore.getState().setOpenAIKey(openAIKey)
    }

    if (spotifyAccessToken && spotifyRefreshToken) {
      useStore.getState().setSpotifyToken({
        access: spotifyAccessToken,
        refresh: spotifyRefreshToken,
      })
    }

    window.getSongInfo = getSongInfo
    window.state = useStore
  }, [])

  const { spotifyRefreshToken, spotifyToken } = router.query

  useEffect(() => {
    if (!spotifyRefreshToken || !spotifyToken) return

    window.localStorage.setItem(
      SPOTIFY_ACCESS_TOKEN_LOCAL_STORAGE_KEY,
      spotifyToken as string
    )

    window.localStorage.setItem(
      SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY,
      spotifyRefreshToken as string
    )

    useStore.getState().setSpotifyToken({
      access: spotifyToken as string,
      refresh: spotifyRefreshToken as string,
    })

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push('/', '/', { shallow: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyRefreshToken, spotifyToken])

  const hasKey = useStore((state) => !!state.openAIKey)

  const [enteredKey, setEnteredKey] = useState<string>('')

  const addKey = (e: FormEvent) => {
    e.preventDefault()

    if (enteredKey) {
      window.localStorage.setItem(OPENAI_LOCAL_STORAGE_KEY, enteredKey)
      useStore.getState().setOpenAIKey(enteredKey)
    }
  }

  const songs = useStore((state) => state.songs)

  return (
    <Layout>
      <Head>
        <title>
          Their Side - Conversations with the most tragically misunderstood
          people of our time
        </title>
        <meta
          name="description"
          content="Conversations with the most tragically misunderstood people of our time."
        />
      </Head>
      <div className="pb-12 pt-16 sm:pb-4 lg:pt-12">
        {hasKey ? (
          <>
            <div className={'lg:px-8'}>
              <div className="lg:max-w-4xl">
                <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
                  <h1 className="text-2xl font-bold leading-7 text-slate-900">
                    Songs
                  </h1>
                </div>
              </div>
            </div>

            <div className="grid max-h-screen grid-cols-2 divide-x divide-slate-500/30 overflow-scroll sm:mt-4 lg:mt-8">
              {songs.map((song) => (
                <SongElement key={song.uri} song={song} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <form className="py-48" onSubmit={addKey}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-slate-300"
                >
                  OpenAI Key
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => setEnteredKey(e.target.value)}
                    type="password"
                    name="email"
                    id="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
