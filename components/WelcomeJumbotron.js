import React from 'react'
import Link from 'next/link'
import Colors from '../utils/Colors'

const WelcomeJumbotron = () => (
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
    <style jsx scoped>{`
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
        margin: 0;
        justify-content: center;
        align-items: center;
      }

      #content{
        text-align: center;
        padding-bottom: 40px;
      }

      #content img {
        margin-bottom: 8fpx;
        width: 100%;
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
    `}</style>
  </div>
)

export default WelcomeJumbotron
