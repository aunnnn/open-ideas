import Page from '../layouts/main'
import Head from 'next/head'
import Link from 'next/link'

export default () => (
  <Page>
    <Head>
      <title>open ideas</title>
    </Head>
    <div className="menu">
      <Link prefetch href="/about"><a>about</a></Link>
      {" | "}
      <Link prefetch href="/home"><a>home</a></Link>
      {" | "}
      <Link prefetch href="/login"><a>login</a></Link>
    </div>
    <div>A place to talk.</div>
    <style jsx>{`
      .menu {
        padding-bottom: 20px;
      }
    `}</style>
  </Page>
)
