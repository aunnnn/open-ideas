
import Head from "next/head"
import Link from "next/link"
import withData from '../lib/withData'
import Colors from '../utils/Colors'

import React, { Component } from 'react'

class WelcomePage extends Component {
  render() {
    return (
      <div>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Welcome to Platonos</title>
        </Head>
        <div id="main">
          <div id="content">
            {/* <img src="/static/plato-red.jpg" /> */}
            <h1>Platonos<sub id="beta">beta</sub></h1>
            <h2>Fostering Your Ideas</h2>
            <div id="bg-wrapper">
              <img src="/static/loginfooterbg.jpg" />
            </div>
            <div>
              <Link prefetch href="/"><a className="go-button">{"I'M IN"}</a></Link>
            </div>
          </div>
        </div>
        <p className="text">"Platonos finds a random user for you to discuss. All talks are public and everyone is anonymous."</p>
        <style jsx global>{`
          * {
            margin: 0;
            box-sizing: border-box;
          }

          body {
            font: 16px monospace;
            font-weight: 400;
          }

          #bg-wrapper {
            min-height: 200px;
          }

          #bg-wrapper {
            display: flex;
            align-items: center;
          }

          .go-button {
            margin-top: 12px;
            font-size: 1.2em;
            font-weight: bold;
            text-decoration: none;
            background: ${Colors.main}
            color: white;
            padding: 8px 14px;
            cursor: pointer;
          }
          .go-button:hover {
            opacity: 0.8;
          }

          #main {
            width: 100%;
            height: 100%;
            width: 100vw;
            height: 100vh;
            margin: 0;
            position: fixed;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          #content{
            text-align: center;
            padding-bottom: 40px;
          }

          #content img {
            margin-bottom: 8fpx;
            width: 100vw;
            max-width: 1000px;
            height: auto;
          }
        
          #content h1 {
            font-size: 50px;
            color: ${Colors.main};
          }

          #beta {
            font-size: 14px;
            color: black;
          }

          #content h2 {
            margin-top: 8px;
            font-weight: normal;
            color: gray;
          }
          .text {
            padding: 0 10px;
            color: gray;
            position: fixed;
            bottom: 30px;
            width: 100vw;
            text-align: center;
          }
        `}</style>
      </div>
    );
  }
}

const WelcomeWithData = withData(WelcomePage)
export default WelcomeWithData
