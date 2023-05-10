/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from 'react'
import { getSongInfo, searchTracks, useStore } from './state'
import { type ChatCompletionRequestMessage } from 'openai'
import { toast } from 'react-hot-toast'
import clsx from 'clsx'

import { type z } from 'zod'
import { CreatePlaylist } from './CreatePlaylist'
import { requestSchema, updateSchema } from '~/utils/data'

const parseSafe = (json: string) => {
  try {
    return JSON.parse(json)
  } catch (error) {
    return undefined
  }
}

export const Chat = () => {
  const [currentMessage, setCurrentMessage] = useState('')

  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([
    {
      role: 'system',
      content: `You are a model that generates playlist for users based on their requests
      ONLY reply in the following format in ndjson (follow the JSON spec properly):
      {"key": "messageToUser", "value": string}
      {"key": "playlistName", "value": string}
      {"key": "song", "value": string}`,
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

    // const updateId = 0
    let strBuffer = ''
    let fullMessage = ''
    let playlistName = ''
    let messageToUser = ''
    const songs: string[] = []

    const data = requestSchema.parse({
      messages: newMessages,
      model: 'gpt-3.5-turbo',
      stream: true,
    })

    const setData = (newData: string[], last?: boolean) => {
      const updates = newData
        .map((update) => {
          const parsed = parseSafe(update)
          if (parsed) {
            return updateSchema.parse(parsed)
          }
          return undefined
        })
        .filter(Boolean) as z.infer<typeof updateSchema>[]

      const checkBuffer = (str: string) => {
        try {
          str = str.replaceAll('\n', '')
          str = str.replaceAll('{', '')
          str = str.replaceAll('}', '')

          str = `{${str}}`

          console.log({ checkBuffer: str })

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

      const newPart = updates
        .map((u) => u.choices?.[0]?.delta?.content ?? undefined)
        .filter(Boolean)
        .join('\n')

      strBuffer += newPart
      fullMessage += newPart

      console.log({ strBuffer, messageToUser, songs, fullMessage })

      if (strBuffer.includes('\n')) {
        const splits = strBuffer.split('}\n')

        for (const split of splits) {
          checkBuffer(`${split}}`)
        }
      }

      if (last) {
        checkBuffer(strBuffer)
      }
    }

    await new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch('/api/openai', {
          method: 'POST',
          body: JSON.stringify(data),
        })

        if (response.body) {
          const reader = response.body.getReader()
          const decoder = new TextDecoder('utf-8')
          let dataBuffer = ''

          const processData = async () => {
            const { value, done } = await reader.read()

            if (done) {
              setData([dataBuffer], true)
              resolve()
              return
            }

            dataBuffer = `${dataBuffer}${decoder.decode(value)}`

            const newUpdates = dataBuffer
              .split('\n')
              .map((u) => u.replace('data: ', ''))

            if (newUpdates.length > 0) {
              dataBuffer = ''
              setData(newUpdates)
            }

            // Keep reading the stream
            processData()
          }

          processData()
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching data:', error.message)
        }
        reject(error)
      }
    })

    setMessages([...messages, { role: 'assistant', content: fullMessage }])

    getSongInfo()

    useStore.getState().setPlaylistName(playlistName)
  }

  const songs = useStore((state) => state.songs)

  // if (!hasKey) return <></>

  return (
    <div className="flex flex-1 flex-col pt-2 sm:pt-12">
      <div className="relative flex h-full w-full flex-col border-t border-slate-700/60 sm:max-h-[55vh]">
        <div className="flex h-full max-h-[30vh] w-full flex-1 flex-col space-y-1 overflow-y-auto px-8 py-4 text-slate-300 sm:max-h-full">
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
            className="mx-2 w-full place-items-end rounded-2xl bg-slate-800 py-2.5 sm:px-0 sm:py-2"
          >
            <input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="What kinda music do you want today?"
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
