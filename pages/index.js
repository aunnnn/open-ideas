import React, { Component } from 'react';
import Head from 'next/head'
import Link from 'next/link'

import withData from '../lib/withData'
import { GC_USER_ID } from '../constants';

import Page from '../layouts/main'

import Menu from '../components/Menu'
import NewChat from '../components/NewChat'
import ChatList from '../components/ChatList'

class IndexPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      title: '',
      loggedIn: false,
    }
  }

  componentDidMount() {
    this.setState({
      loggedIn: localStorage.getItem(GC_USER_ID),
    })
  }

  render() {
    return (
      <Page>
        <Head>
          <title>open ideas</title>
        </Head>
    
        <Menu />
    
        <div className="main">
          {this.state.loggedIn ?
            <NewChat />
            :
            <div className="please-login"><Link prefetch href="/login"><a className="login-button">Login</a></Link> to create a chat</div>
          }
          <br/>
          <ChatList />
        </div>
        <style jsx>{`
          .login-button {
            color: blue;
            font-size: 18px;
            font-weight: bold;
          }
    
          .please-login {
            font-size: 14px;
          }
        `}</style>
      </Page>
    )
  }
} 

export default withData(IndexPage)
