import Page from '../layouts/main'
import Head from 'next/head'
import withData from '../lib/withData'

const TalkPage = () => (
  <Page>
    <Head>
      <title>Platonos</title>
    </Head>
    <div>
      A place to talk.
    </div>
  </Page>
)

export default withData(TalkPage)
