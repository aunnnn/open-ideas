import React, { Component } from 'react';
import Head from 'next/head'
import Link from 'next/link'

import withData from '../lib/withData'
import { GC_USER_ID } from '../constants';

import Page from '../layouts/main'

import Menu from '../components/Menu'
import NewChat from '../components/NewChat'
import ChatList from '../components/ChatList'
import Chatroom from '../components/Chatroom'

class IndexPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      title: '',
      loggedIn: false,
      currentRoomId: null,
    }
  }

  componentDidMount() {
    this.setState({
      loggedIn: localStorage.getItem(GC_USER_ID),
    })
  }

  onClickChatroom = (id) => {
    this.setState({
      currentRoomId: id
    })
  }

  render() {
    return (
      <Page style={{ overflow: 'auto' }}>
        <Head>
          <title>open ideas</title>
        </Head>
        <div className="container">
          <Menu />
      
          {this.state.loggedIn ?
            <NewChat />
            :
            <div className="please-login"><Link prefetch href="/login"><a className="login-button">Login</a></Link> to create a chat</div>
          }
          <br/>

          <div className="chat-container">
            <div className="left"><ChatList onClickChatroom={this.onClickChatroom} /></div>
            { this.state.currentRoomId && <div className="right"><Chatroom roomId={this.state.currentRoomId} /></div>}
          </div>
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

          .chat-container {
            display: flex;
            min-width: 500px;
          }

          .left {
            flex: 0 0 25%;
            min-width: 240px;
            max-width: 420px;
            overflow-y: hidden;
            position: relative;
            border-right: 1px solid rgba(0, 0, 0, .20);
          }

          .right {
            display: flex;
            flex: 3;
            flex-direction: column;
            min-width: 0;
            padding-left: 12px;
          }
        `}</style>
      </Page>
    )
  }
} 

export default withData(IndexPage)
