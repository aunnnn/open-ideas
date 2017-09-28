import React, { Component } from 'react';
import Link from 'next/link'
import Menu from '../components/Menu'
import Meta from '../components/meta'
import { GC_USER_ID } from '../constants'

class MainLayout extends Component {

  render() { 
    return (
      <div className="main">
        <div className="logo">
          <Link prefetch href="/"><a>Platonos</a></Link>
        </div>

        { this.props.children }

        { /* global styles and meta tags */ }
        <Meta />

        { /* local styles */ }
        <style jsx>{`
          .main {
            padding: 25px 50px;
            height: 100%;
            display: block;
          }

          .logo {
            padding-bottom: 20px;
          }

          .logo a:hover {
            color: black;
          }

          a {
            text-decoration: none;
            font-size: 2em;
            color: purple;
          }

          a:active {
            color: black;
          }

          @media (max-width: 500px) {
            .main {
              padding: 25px 15px;
            }

            .logo {
              padding-bottom: 20px;
            }
          }
        `}</style>
      </div>
    )
  }
}
  
export default MainLayout;
