import React, { Component } from 'react';
import Page from '../layouts/main'
import Head from 'next/head'
import Link from 'next/link'
import withData from '../lib/withData'
import NewChat from '../components/NewChat'
import ChatList from '../components/ChatList'
import { GC_USER_ID } from '../constants';

class HomePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      loggedIn: null,
    }
  }

  componentDidMount() {
    this.setState({
      loggedIn: localStorage.getItem(GC_USER_ID)
    })
  }

  render() {
    console.log('loggedin?', this.state.loggedIn)
    return (
      <Page>
        <Head>
          <title>home</title>
        </Head>
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
            float: right;
            font-size: 14px;
          }
        `}</style>
      </Page>
    )
  }
}

export default withData(HomePage)
