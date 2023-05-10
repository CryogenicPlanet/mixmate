import { type AppType } from 'next/app'

import { api } from '~/utils/api'
import { Toaster } from 'react-hot-toast'

import '~/styles/globals.css'
import Head from 'next/head'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </>
  )
}

export default api.withTRPC(MyApp)
