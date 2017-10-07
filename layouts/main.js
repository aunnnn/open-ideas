import React, { Component } from 'react'
import { connect } from 'react-redux'
import Link from 'next/link'
import { withRouter } from 'next/router'

import Meta from '../components/meta'
import { loggedOut } from '../lib/authActions'

import Colors from '../utils/Colors'

class MainLayout extends Component {

  onClickLogout = (e) => {
    e.preventDefault()
    if (confirm('Do you want to logout?')) {
      this.props.onLoggedout()   
    }
  }

  render() {    
    const isLoggedIn = this.props.isLoggedIn    
    const { pathname } = this.props.router
    return (
      <div className="main">
        { /* global styles and meta tags */ }
        <Meta />

        {/* Site content */}
        <div className="sidebar">
          <Link prefetch href="/">
            <a className="logo">
              <img src="/static/plato-red.jpg" className="logo-img"/>
              <h1 className="logo-text">Platonos</h1>
            </a>
          </Link>
          <div className="button-wrapper">
            <Link prefetch href="/talk"><a className={pathname === '/talk' && 'active'}>Talk</a></Link>
            <Link prefetch href="/"><a className={pathname === '/' && 'active'}>Read</a></Link>
            
            {isLoggedIn ?
              <a onClick={this.onClickLogout}>Logout</a>
              :
              <Link prefetch href="/join"><a className={pathname === '/join' && 'active'}>Join</a></Link>}                        
          </div>
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
            height: 100vh;
          }
          .sidebar {
            flex-basis: 98px;
            min-width: 98px;
            border-right: 1px solid #ddd;
          }
          .logo {
            pointer: cursor;
          }
          .logo-img {
            margin: 15px 25px 7px;
            width: 48px;
          }
          .logo-text {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            margin: 0 0 15px;
            color: ${Colors.main};
          }
          .button-wrapper {
            margin-top: 20px;
          }
          .button-wrapper a {
            height: 50px;
            color: #000;
            display: block;
            text-align: center;
            padding: 15px 0;
            cursor: pointer;
          }
          .button-wrapper a:hover {
            background-color: ${Colors.lightGrey};
          }
          .button-wrapper a.active {
            font-weight: bold;
            background-color: ${Colors.lightGrey};
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
          }
          .world {
            flex: 1 1 auto;
          }
        `}</style>
      </div>
    )
  }
}

export default withRouter(connect(
  (state) => {
    return { 
      isLoggedIn: state.authReducers.isLoggedIn,
    }
  },
  (dispatch) => ({
    onLoggedout() {
      dispatch(loggedOut())
    }
  }),
)(MainLayout))
