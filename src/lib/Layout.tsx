import { Fragment, useId } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import posterImage from '~/image/playlist.png'
import { Chat } from './Chat'

function randomBetween(min: number, max: number, seed = 1) {
  return () => {
    let rand = Math.sin(seed++) * 10000
    rand = rand - Math.floor(rand)
    return Math.floor(rand * (max - min + 1) + min)
  }
}

function Waveform(props: JSX.IntrinsicElements['svg']) {
  const id = useId()
  const bars = {
    total: 100,
    width: 2,
    gap: 2,
    minHeight: 40,
    maxHeight: 100,
  }

  const barHeights = Array.from(
    { length: bars.total },
    randomBetween(bars.minHeight, bars.maxHeight)
  )

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="40%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </linearGradient>
        <linearGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="#4989E8" />
          <stop offset="50%" stopColor="#6159DA" />
          <stop offset="100%" stopColor="#FF54AD" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect width="100%" height="100%" fill={`url(#${id}-pattern)`} />
        </mask>
        <pattern
          id={`${id}-pattern`}
          width={bars.total * bars.width + bars.total * bars.gap}
          height="100%"
          patternUnits="userSpaceOnUse"
        >
          {Array.from({ length: bars.total }, (_, index) => (
            <rect
              key={index}
              width={bars.width}
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              height={`${barHeights[index]}%`}
              x={bars.gap * (index + 1) + bars.width * index}
              fill={`url(#${id}-fade)`}
            />
          ))}
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#${id}-gradient)`}
        mask={`url(#${id}-mask)`}
        opacity="0.25"
      />
    </svg>
  )
}

export function Layout({ children }: React.PropsWithChildren) {
  const hosts = ['Scalar']

  return (
    <div className="grid h-full max-h-screen min-h-screen grid-cols-12 overflow-hidden bg-slate-900">
      <header className="col-span-3 grid grid-cols-12 bg-slate-900">
        <div className="col-span-1 lg:sticky lg:top-0 lg:flex lg:w-16 lg:flex-none lg:items-center lg:whitespace-nowrap lg:py-12 lg:text-sm lg:leading-7 lg:[writing-mode:vertical-rl]">
          <span className="font-mono text-slate-500">Build by</span>
          <span className="mt-6 flex gap-6 font-bold text-slate-300">
            {hosts.map((host, hostIndex) => (
              <Fragment key={host}>
                {hostIndex !== 0 && (
                  <span aria-hidden="true" className="text-slate-400">
                    /
                  </span>
                )}
                {host}
              </Fragment>
            ))}
          </span>
        </div>
        <div className="relative z-10 col-span-11 mx-auto flex h-full max-h-screen flex-col pt-10 md:max-w-2xl lg:min-h-full lg:flex-auto lg:border-x lg:border-slate-800/70 lg:pt-12">
          <div className="px-12">
            <Link
              href="/"
              className="relative mx-auto block w-48 overflow-hidden rounded-lg bg-slate-200 shadow-xl sm:w-64 sm:rounded-xl lg:w-auto lg:rounded-2xl"
              aria-label="Homepage"
            >
              <Image
                className="w-full"
                src={posterImage}
                alt=""
                sizes="(min-width: 1024px) 20rem, (min-width: 640px) 16rem, 12rem"
                priority
              />
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 sm:rounded-xl lg:rounded-2xl" />
            </Link>
          </div>
          <div className="mt-10 px-8 text-center lg:mt-12 lg:text-left">
            <p className="text-xl font-bold text-slate-300">
              <Link href="/">Mixmate</Link>
            </p>
            <p className="mt-3 text-lg font-medium leading-8 text-slate-400">
              Talk to GPT and get a mixtape back
            </p>
          </div>
          <Chat></Chat>
        </div>
      </header>
      <main className="relative col-span-9 flex h-full flex-col">
        <Waveform className="absolute left-0 top-0 h-20 w-full -translate-x-3" />
        <div className="relative h-full">{children}</div>
      </main>
    </div>
  )
}
