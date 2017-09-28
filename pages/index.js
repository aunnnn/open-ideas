import React, { Component } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import { graphql, gql } from 'react-apollo'

import withData from '../lib/withData'
import { GC_USER_ID, GC_USERNAME } from '../constants';

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
      currentRoomId: null,
      currentUserId: null,
      currentUsername: null,
    }
  }

  componentDidMount() {
    this.setState({
      currentUserId: localStorage.getItem(GC_USER_ID),
      currentUsername: localStorage.getItem(GC_USERNAME),
    })
  }

  goToChatroom = (id) => {
    this.setState({
      currentRoomId: id,
    })
  }

  render() {

    // This works after redirect to first page after login
    const { currentUserId, currentUsername } = this.state
    
    return (
      <Page style={{ overflow: 'auto' }}>
        <Head>
          <title>Platonos</title>
        </Head>
        <div className="container">

          <Menu />

          {/* DISPLAY CURRENT USER  */}
          {currentUsername && <div><b>Hi, {currentUsername}</b></div>}

          {/* NEW CHAT INPUT */}
          {currentUserId ?
            <NewChat onCreateNewChatroom={this.goToChatroom} currentUserId={currentUserId} />
            :
            <div className="please-login"><Link prefetch href="/login"><a className="login-button">Login</a></Link> to create a chat</div>
          }

          <br/>

          {/* CHAT PANEL  */}
          <div className="chat-container">
            <div className="left">
              <ChatList onClickChatroom={this.goToChatroom} />
            </div>
            
            { 
                this.state.currentRoomId 
              && 
                <div className="right">
                  <Chatroom roomId={this.state.currentRoomId} currentUserId={currentUserId} />
                </div> 
              || 
                'Select chatroom'
            }
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

const CURRENT_USER_QUERY = gql`
query {
  user {
    id,
    username
  }
}
`

export default withData(graphql(CURRENT_USER_QUERY, { name: "currentUserQuery" })(IndexPage))
