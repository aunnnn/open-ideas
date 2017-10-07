import React, { Component } from 'react'
import { connect } from 'react-redux'
import Link from 'next/link'
import { withRouter } from 'next/router'
import fetch from 'isomorphic-fetch'
import debounce from 'lodash/debounce'

import Meta from '../components/meta'
import { loggedOut } from '../lib/authActions'

import Colors from '../utils/Colors'
import { PLATONOS_API_ENDPOINT } from '../constants'

class MainLayout extends Component {

  constructor(props) {
    super(props)
    this.updateUserLastActive = debounce(this.updateUserLastActive, 1000)
  }

  onClickLogout = (e) => {
    e.preventDefault()
    if (confirm('Do you want to logout?')) {
      this.props.onLoggedout()   
    }
  }

  updateUserLastActive = async () => {
    if (!process.browser) return
    if (!this.props.currentUserId) return
    const currentUserId = this.props.currentUserId
    try {
      const header = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      })

      await fetch(`${PLATONOS_API_ENDPOINT}/updateUserLastActiveAt/${currentUserId}`, {
        method: 'GET',
        mode: 'no-cors',
        // header,
      })
    } catch (err) {
      console.error('Cannot update user last active: ', err)
    }
  }

  render() {    

    this.updateUserLastActive()

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
            color: #972952;
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
      currentUserId: state.authReducers.authData && state.authReducers.authData.currentUserId,
    }
  },
  (dispatch) => ({
    onLoggedout() {
      dispatch(loggedOut())
    }
  }),
)(MainLayout))
