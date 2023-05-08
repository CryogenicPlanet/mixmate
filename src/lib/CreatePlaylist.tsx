import toast from 'react-hot-toast'
import { api } from '~/utils/api'
import { useStore } from './state'

export const CreatePlaylist = () => {
  const { mutateAsync } = api.spotify.createPlaylist.useMutation({})

  return (
    <button
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        toast.promise(
          mutateAsync({
            access: useStore.getState().spotifyToken.access,
            refresh: useStore.getState().spotifyToken.refresh,
            name: useStore.getState().playlistName,
            songs: useStore.getState().songs.map((song) => song.uri),
          }),
          {
            loading: 'Creating playlist...',
            success: (data) => {
              useStore.getState().setCurrentSong({
                title: data.body.name,
                uri: data.body.uri,
                image: data.body.images[0]?.url || '',
                artist: 'Mixmate',
              })

              const spotifyWebUrl = `https://open.spotify.com/playlist/${data.body.id}`
              window.open(spotifyWebUrl, '_blank')

              return 'Playlist created!'
            },
            error: 'Something went wrong',
          }
        )
      }}
      type="button"
      className="rounded-xl bg-indigo-600 px-2.5 py-1.5 text-xs text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-base"
    >
      Create Playlist
    </button>
  )
}
