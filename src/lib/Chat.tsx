/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from 'react'
import { getSongInfo, searchTracks, useStore } from './state'
import { type ChatCompletionRequestMessage } from 'openai'
import { toast } from 'react-hot-toast'
import clsx from 'clsx'

import { z } from 'zod'
import { CreatePlaylist } from './CreatePlaylist'

const updateSchema = z
  .object({
    id: z.string(),
    object: z.string(),
    created: z.number(),
    model: z.string(),
    choices: z.array(
      z.object({
        delta: z.object({
          role: z.string().optional(),
          content: z.string().optional(),
        }),
        index: z.number(),
        finish_reason: z.string().or(z.null()),
      })
    ),
  })
  .deepPartial()

export const Chat = () => {
  const [currentMessage, setCurrentMessage] = useState('')

  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([
    {
      role: 'system',
      content: `You are a model that generates playlist for users based on their requests
      ONLY reply in the following format in ndjson:
      {key: "messageToUser", value: string}
      {key: "playlistName", value: string}
      {key: "song", value: string}`,
    },
  ])

  const [displayMessage, setDisplayMessage] = useState<
    {
      role: 'user' | 'assistant'
      content: string
    }[]
  >([])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newMessages: ChatCompletionRequestMessage[] = [
      ...messages,
      { role: 'user', content: currentMessage },
    ]

    const displayMessageClone = structuredClone(displayMessage)

    setDisplayMessage([
      ...displayMessage,
      { role: 'user', content: currentMessage },
    ])

    displayMessageClone.push({ role: 'user', content: currentMessage })

    setCurrentMessage('')

    const openai = useStore.getState().openAI

    if (!openai) throw new Error('OpenAI is not initialized')

    let updateId = 0
    let strBuffer = ''
    let fullMessage = ''
    let playlistName = ''
    let messageToUser = ''
    const songs: string[] = []

    await new Promise<void>((resolve) => {
      openai.createChatCompletion(
        {
          messages: newMessages,
          model: 'gpt-3.5-turbo',
          stream: true,
        },
        {
          onDownloadProgress(event: ProgressEvent) {
            const target = event.target as XMLHttpRequest
            const newUpdates = target.responseText
              .replace('data: [DONE]', '')
              .trim()
              .split('data: ')
              .filter(Boolean)

            const checkBuffer = (str: string) => {
              console.log('checkBuffer', {
                str,
              })

              try {
                if (str.includes('\n')) {
                  const splits = str.split('\n')

                  for (const split of splits) {
                    checkBuffer(split)
                  }

                  return
                }

                const lineJson = JSON.parse(str) as {
                  key: string
                  value: string
                }

                if (lineJson.key === 'messageToUser') {
                  messageToUser = lineJson.value

                  setDisplayMessage([
                    ...displayMessageClone,
                    {
                      role: 'assistant',
                      content: messageToUser,
                    },
                  ])

                  strBuffer = ''
                } else if (lineJson.key === 'song') {
                  const song = lineJson.value

                  useStore.getState().addSongName(song)

                  searchTracks(song).then((track) => {
                    if (!track) return
                    useStore.getState().addSong(track)
                  })

                  songs.push(song)

                  setDisplayMessage([
                    ...displayMessageClone,
                    {
                      role: 'assistant',
                      content: `${messageToUser}\n${songs.join(', \n')}`,
                    },
                  ])

                  strBuffer = ''
                } else if (lineJson.key === 'playlistName') {
                  playlistName = lineJson.value

                  strBuffer = ''
                }
              } catch (e) {
                console.warn('Error parsing JSON', e)
                // console.log(e)
              }
            }

            // Resolve when the last update is received
            if (newUpdates[newUpdates.length - 1]?.includes('[DONE]')) {
              checkBuffer(strBuffer)
              resolve()
            }

            if (newUpdates.length > updateId) {
              for (let i = updateId; i < newUpdates.length; i++) {
                const update = newUpdates[i]

                console.log({ update })

                if (!update) continue

                const json = updateSchema.parse(JSON.parse(update))

                if (json.choices?.[0]?.finish_reason === 'stop') {
                  checkBuffer(strBuffer)
                  resolve()
                }

                const delta = json.choices?.[0]?.delta

                if (!delta) continue

                if (delta.content) {
                  strBuffer += delta.content
                  fullMessage += delta.content

                  console.log({ strBuffer, messageToUser, songs })

                  if (strBuffer.includes('\n')) {
                    const splits = strBuffer.split('\n')

                    for (const split of splits) {
                      checkBuffer(split)
                    }
                  }
                }
              }

              updateId = newUpdates.length
            }
          },
        }
      )
    })

    setMessages([...messages, { role: 'assistant', content: fullMessage }])

    getSongInfo()

    useStore.getState().setPlaylistName(playlistName)
  }

  const hasKey = useStore((state) => !!state.openAIKey)

  const songs = useStore((state) => state.songs)

  if (!hasKey) return <></>

  return (
    <div className="flex flex-1 flex-col pt-2 sm:pt-12">
      <div className="relative flex h-full w-full flex-col border-t border-slate-700/60 sm:max-h-[55vh]">
        <div className="flex h-full max-h-[20vh] w-full flex-1 flex-col space-y-1 overflow-y-auto px-8 py-4 text-slate-300 sm:max-h-full">
          {displayMessage.map((message, i) => {
            return (
              <div
                key={`message-${i}`}
                className={clsx(
                  'flex w-full',
                  message.role === 'user'
                    ? 'text-indigo-100'
                    : 'text-fuchsia-300'
                )}
              >
                <p>{message.content}</p>
              </div>
            )
          })}
        </div>
        <div className="flex w-full place-items-end">
          <form
            onSubmit={(e) => {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              toast.promise(onSubmit(e), {
                error: (err) => {
                  console.error(err)

                  return 'Error fetching data'
                },
                loading: 'Generating playlist ...',
                success: 'Playlist generated!',
              })
            }}
            className="mx-2 w-full place-items-end rounded-2xl bg-slate-800 py-2.5 sm:rounded-none sm:px-0 sm:py-2"
          >
            <input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Send a message"
              className="h-full w-full resize-none border-transparent  bg-transparent px-8 text-slate-300 outline-none ring-0 focus:border-transparent focus:outline-none focus:ring-0 active:outline-none"
            ></input>
          </form>
          <div className="block sm:hidden">
            {songs.length > 0 && <CreatePlaylist></CreatePlaylist>}
          </div>
        </div>
      </div>
    </div>
  )
}
