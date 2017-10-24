import Page from "../layouts/main"
import Head from "next/head"
import React, { Component } from 'react'

import connectAuth from '../lib/connectAuth'
import withData from '../lib/withData'

class AboutPage extends Component {
  render() {
    return (
      <Page>
        <Head>
          <title>About us</title>
        </Head>
        <div className="main">
          <h1>What is Platonos?</h1>
          <br/>
          <div className="body">
            <p>Platonos finds a random user for you to discuss on a topic you create.</p>
            <br/>
            <strong>All talks are public and everyone is anonymous.</strong>
            <br/><br/>
            <p>
              We all have thoughts, beliefs, something brewing deep inside us that are rarely shared with others.
              The reason could be that it is simply weird to bring up such topics. 
              This is sad, since they are very original, meaningful and personal.
              Knowing what others think about them is a good way to foster your thoughts, and ideas.
            </p>
            <br/>
            <p>
              Any talks can be rewarding if participants are open-minded and thoughtful. 
              Any topic, without jargons, can be explained so that anyone could appreciate it.
            </p>
          </div>
        </div>
        <style jsx>{`
          .main {
            margin: 8px;
          }
          .body {
            width: 480px;
          }
        `}</style>
      </Page>
    );
  }
}

export default withData(connectAuth(AboutPage));
