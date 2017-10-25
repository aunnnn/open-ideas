import Page from "../layouts/main"
import Head from "next/head"
import React, { Component } from 'react'

import connectAuth from '../lib/connectAuth'
import withData from '../lib/withData'
import Colors from '../utils/Colors'

class AboutPage extends Component {
  render() {
    return (
      <Page>
        <Head>
          <title>About us</title>
        </Head>
        <div className="container">
          <div className="content">
            <h1>What is Platonos?</h1>
            <br/>
            <p>
              Platonos finds a random user to discuss on your topic.
              <strong> All talks are public and everyone is anonymous.</strong>
            </p>
            <br/>
            <br/>
            <div>
              <h3>How?</h3>
              <br/>
              <ol>
                <li>An author initiates a topic.</li>
                <li>A random match is invited.</li>
                <li>The match either accepts or rejects the talk. If accept, the talk starts immediately. If reject, another user is invited.</li>
                <li>The talk ends if any participant ends it.</li>
              </ol>
              <div className="icon-explained">
                <div className="author">
                  <img src="/static/plato-red.jpg" alt="Plato-red" className="plato"/>
                  <p>Author</p>
                </div>
                <div className="match">
                  <img src="/static/plato.jpg" alt="Plato-red" className="plato"/>
                  <p>Match</p>
                </div>
              </div>
            </div>
            <br/><br/>
            <div>
              <h3>Why?</h3>
              <br/>
              <p>
                We all have thoughts, beliefs, and something brewing deep inside us.
                They are very personal, original, and meaningful.
                However, we rarely share them with others, simply because it is weird to them bring up.
                Despite our technological advances, this is still a problem today.
                Knowing what others think about our thoughts helps us grow intellectually.
                Platonos is an experimental platform that aims to achieve that.
              </p>
              <br/>
              <p>
                Any talk is rewarding if participants are open-minded and thoughtful. 
                Any topic, without jargons, can be explained so that anyone could appreciate it.
                Everyone is worth talking with.
              </p>
            </div>
          </div>
        </div>
        <style jsx>{`
          .container {
            display: flex;
            flex: 1;
            height: 100vh;      
            padding: 8px;      
            overflow: auto;
          }
          .content {
            max-width: 540px;
          }
          .plato {
            width: 64px;
            height: auto;
          }
          .icon-explained {
            margin-top: 20px;
          }
          .icon-explained>div {
            display: inline-block;
            margin: 8px;
          }
          .icon-explained .author p {
            color: ${Colors.main};
          }
          .icon-explained p {
            font-weight: bold;
            text-align: center;
          }
        `}</style>
      </Page>
    );
  }
}

export default withData(connectAuth(AboutPage));
