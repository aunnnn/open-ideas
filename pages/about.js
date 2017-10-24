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
        <div className="main">
          <h1>What is Platonos?</h1>
          <br/>
          <p className="body">
            Platonos finds a random user for you to discuss on a topic you create.
            <br/><br/>
            <strong>All talks are public and everyone is anonymous.</strong>
            <br/><br/>
            We all have thoughts, beliefs, something brewing deep inside us that are rarely shared with others.
            The reason could be that it is simply weird to bring up such topics, which is sad, since they are very original, meaningful and personal.
            Despite our technological advance, most of them are kept in places where no one can see.
            They were left alone and gone as generations passed.
            However, they are the very mark of human being.
            They are so important that we want keep them here.
            <br/>
            <br/>
            Any talks can be rewarding if both of us are open-minded and thoughtful. 
            Any topics, without jargons, can be presented so that anyone could appreciate it.
            <br/>
            <br/>
            We find many subjects worth thinking and talking.
            <br/>
            We are not afraid to learn from others.
            <br/>
            We are willing to explain others.
            <br/>
            We know that we know nothing.
          </p>          
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

export default withData(AboutPage);
