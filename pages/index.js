import Page from '../layouts/main'
import Head from 'next/head'
import Link from 'next/prefetch'

export default () => (
  <Page>
    <Head>
      <title>open ideas</title>
    </Head>

    Chat here.
    <Link href="/about"><a>about</a></Link>
  </Page>
)
