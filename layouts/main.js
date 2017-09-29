import React, { Component } from 'react';
import Link from 'next/link'
import Menu from '../components/Menu'
import Meta from '../components/meta'
import { GC_USER_ID } from '../constants'

class MainLayout extends Component {

  render() { 
    return (
      <div className="main">
        { /* global styles and meta tags */ }
        <Meta />

        {/* Site content */}
        <div className="sidebar">
          hey
        </div>
        <div className="world">
          { this.props.children }
        </div>
        {/* <div className="logo">
          <Link prefetch href="/"><a>Platonos</a></Link>
        </div> */}

        { /* local styles */ }
        <style jsx>{`
          .main {
            display: flex;
            flex-direction: row;
            background-color: blue;
            height: 100vh;
          }
          .sidebar {
            flex-basis: 85px;
            min-width: 85px;
            border-left: 1px solid #ddd;
          }
          .world {
            background-color: red;
            flex: 1 1 auto;
          }
        `}</style>
      </div>
    )
  }
}
  
export default MainLayout;
