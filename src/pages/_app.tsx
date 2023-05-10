import { type AppType } from 'next/app'

import { api } from '~/utils/api'
import { Toaster } from 'react-hot-toast'
import { DefaultSeo } from 'next-seo'

import '~/styles/globals.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <DefaultSeo
        title="Mixmate"
        description="Mixmate is a tool to help you create spotify playlists with chatgpt."
        openGraph={{
          images: [
            {
              url: '/og.png',
              alt: 'Mixmate',
            },
          ],
        }}
        additionalLinkTags={[
          {
            href: '/favicon.ico',
            rel: 'icon',
          },
          {
            href: '/apple-touch-icon.png',
            rel: 'apple-touch-icon',
            sizes: '180x180',
          },
          {
            href: '/favicon-32x32.png',
            rel: 'icon',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            href: '/favicon-16x16.png',
            rel: 'icon',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            href: '/site.webmanifest',
            rel: 'manifest',
          },
        ]}
      />
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </>
  )
}

export default api.withTRPC(MyApp)
