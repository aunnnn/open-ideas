import Page from "../layouts/main"
import Head from "next/head"
import React, { Component } from 'react'

import withData from '../lib/withData'

class AboutPage extends withData(Component) {
  render() {
    return (
      <Page>
        <Head>
          <title>About us</title>
        </Head>
        <div>A place to talk.</div>
      </Page>
    );
  }
}

export default withData(AboutPage);
