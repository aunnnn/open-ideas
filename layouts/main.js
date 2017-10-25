import React, { Component } from 'react'
import { connect } from 'react-redux'
import Link from 'next/link'
import Router from 'next/router'
import { withRouter } from 'next/router'
import NoSSR from 'react-no-ssr'
import fetch from 'isomorphic-fetch'
import debounce from 'lodash/debounce'

import Meta from '../components/meta'
import { loggedOut } from '../lib/authActions'
import { initGA, logPageView } from '../lib/analytics'

import Colors from '../utils/Colors'
import { PLATONOS_API_ENDPOINT } from '../constants'

class MainLayout extends Component {

  constructor(props) {
    super(props)
    this.updateUserLastActive = debounce(this.updateUserLastActive, 1000)
  }

  componentDidMount() {
    if (!window.GA_INITIALIZED) {
      initGA()
      window.GA_INITIALIZED = true
    }
    logPageView() 
  }

  onClickLogout = (e) => {
    e.preventDefault()
    if (confirm('Do you want to logout?')) {
      this.props.onLoggedout()
      Router.push({
        pathname: '/'        
      })   
    }
  }

  updateUserLastActive = async () => {
    if (!process.browser) return
    if (!this.props.currentUserId) return
    const currentUserId = this.props.currentUserId
    try {
      await fetch(`${PLATONOS_API_ENDPOINT}/updateUserLastActiveAt/${currentUserId}`)
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
            <div className="upper-pane">
              <Link prefetch href="/"><a className={pathname === '/' && 'active'}>Read</a></Link>
              <Link prefetch href="/talk"><a className={pathname === '/talk' && 'active'}>Talk</a></Link>
              {isLoggedIn ?
                // Fix the wrong reuse component ssr problems (without this, profile won't get highlighted when you go to the page directly.)
                <NoSSR>
                  <Link prefetch href="/profile"><a className={pathname === '/profile' && 'active'}>Profile</a></Link>
                  <a onClick={this.onClickLogout}>Logout</a>
                </NoSSR>
                :
                <Link prefetch href="/join"><a className={pathname === '/join' && 'active'}>Join</a></Link>}                        
            </div>
            <div className="lower-pane">
              <Link prefetch href="/about"><a className={pathname === '/about' && 'active'}>About</a></Link>
            </div>
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
            min-width: 98px;
            border-right: 1px solid #ddd;
            display: flex;
            flex-direction: column;
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
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          }
          .button-wrapper .upper-pane a {
            height: 50px;
          }
          .button-wrapper .upper-pane {
            display: flex;
            flex-direction: column;
          }
          .button-wrapper a {
            color: #000;
            display: block;
            text-align: center;
            padding: 15px 0;
            cursor: pointer;
            outline: none;
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
          .lower-pane {
            margin-top: auto;
            margin-bottom: 30px;
          }
          .lower-pane a {
            font-size: .9em !important;
          }
          .world {
            flex: 1 1 auto;
          }
        `}</style>
      </div>
    )
  }
}

const MainLayoutWithRedux = connect(
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
)(MainLayout)

const MainLayoutWithRouter = withRouter(MainLayoutWithRedux)
export default MainLayoutWithRouter
