/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { create } from 'zustand'

import { Configuration, OpenAIApi } from 'openai'

import SpotifyWebApi from 'spotify-web-api-js'
import { apiClient } from '~/utils/api'
import { env } from '~/env.mjs'

const spotifyApi = new SpotifyWebApi()

export const searchTracks = async (query: string): Promise<Song | null> => {
  try {
    spotifyApi.setAccessToken(useStore.getState().spotifyToken.access)

    const data = await spotifyApi.searchTracks(query)

    const track = data.tracks.items[0]

    if (!track) return null

    const name = track.name
    const artist = track.artists.map((a) => a.name).join(', ')
    const uri = track.uri
    const img = track.album.images[0]?.url || ''

    return {
      title: name,
      artist,
      uri,
      image: img,
    } satisfies Song
  } catch (err) {
    console.error({ err })

    if (err instanceof XMLHttpRequest) {
      // Detect if token is expired
      if (err.status === 401) {
        const data = await apiClient.spotify.refresh.query({
          access: useStore.getState().spotifyToken.access,
          refresh: useStore.getState().spotifyToken.refresh,
        })

        useStore.getState().setSpotifyToken({
          access: data.body.access_token,
          refresh:
            data.body.refresh_token || useStore.getState().spotifyToken.refresh,
        })

        return searchTracks(query)
      }

      throw new Error('HTTP request failed')
    }

    throw new Error('Unknown error')
  }
}

export type Song = {
  uri: string
  title: string
  artist: string
  image: string
}

export const getSongInfo = async () => {
  const songNames = useStore.getState().songNames

  spotifyApi.setAccessToken(useStore.getState().spotifyToken.access)

  const songsPromise = songNames.map((songName) => searchTracks(songName))

  const songs = await Promise.all(songsPromise)

  const foundSongs = songs.filter((song) => song) as Song[]

  useStore.getState().setSongs(foundSongs)

  console.log({ foundSongs })
}

export const OPENAI_LOCAL_STORAGE_KEY = 'openai-key'
export const SPOTIFY_ACCESS_TOKEN_LOCAL_STORAGE_KEY = 'spotify-access-token'
export const SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY = 'spotify-refresh-token'

type Store = {
  openAIKey: string
  spotifyToken: {
    access: string
    refresh: string
  }
  playlistName: string
  setPlaylistName: (name: string) => void
  setSpotifyToken: (token: { access: string; refresh: string }) => void
  openAI: OpenAIApi | null
  setOpenAIKey: (key: string) => void
  songNames: string[]
  songs: Song[]
  setSongNames: (songNames: string[]) => void
  addSongName: (songName: string) => void
  addSong: (song: Song) => void
  setSongs: (songs: Song[]) => void
  currentSong: Song | null
  setCurrentSong: (song: Song | null) => void
}

export const useStore = create<Store>((set) => ({
  openAIKey: env.NEXT_PUBLIC_DANGEROUS_OPENAI_API_KEY,
  spotifyToken: {
    access: '',
    refresh: '',
  },
  playlistName: '',
  setPlaylistName: (name: string) => {
    set({ playlistName: name })
  },
  setSpotifyToken: (token: { access: string; refresh: string }) => {
    set({ spotifyToken: token })
  },
  addSongName: (songName: string) => {
    set({ songNames: [...useStore.getState().songNames, songName] })
  },
  addSong: (song: Song) => {
    set({ songs: [...useStore.getState().songs, song] })
  },
  openAI: null,
  setOpenAIKey: (key: string) => {
    const configuration = new Configuration({
      apiKey: key,
    })
    const openai = new OpenAIApi(configuration)

    set({ openAIKey: key, openAI: openai })
  },
  songs: [],
  songNames: [],
  setSongNames: (songNames: string[]) => {
    set({ songNames: songNames })

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getSongInfo()
  },
  setSongs: (songs: Song[]) => set({ songs: songs }),
  currentSong: null,
  setCurrentSong: (song: Song | null) => set({ currentSong: song }),
}))
