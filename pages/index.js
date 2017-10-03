import React, { Component } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'

import connectAuth from '../lib/connectAuth'
import { graphql, gql, compose } from 'react-apollo'

import withData from '../lib/withData'

import { GC_USER_ID, GC_USERNAME } from '../constants';

import Page from '../layouts/main'
import NewChat from '../components/NewChat'
import ChatList from '../components/ChatList'
import ChatListItem from '../components/ChatListItem'
import Chatroom from '../components/Chatroom'

import { CHATROOM_QUERY } from '../components/Chatroom'

class IndexPage extends Component {

  static async getInitialProps({ query }) {
    // for those who enters from link platonos.com/chatrooms/chatroomId
    return { initialChatroomId: query.chatroomId }
  }

  constructor(props) {
    super(props)
    this.state = {
      title: '',      
    }    
  }

  goToChatroom = (id) => {
    Router.push(`/?chatroomId=${id}`, `/chatrooms/${id}`, { shallow: true })
  }

  render() {    
    // This works after redirect to first page after login
    const { currentUserId, currentUsername } = this.props
    const currentRoomId = this.props.url.query.chatroomId || this.props.initialChatroomId

    const initialChatroom = this.props.initialChatroom
    let initialChatroomLoading, initialChatroomError, initialChat
    if (initialChatroom) {
      initialChatroomLoading = initialChatroom.loading
      initialChatroomError = initialChatroom.error
      initialChat = initialChatroom.Chatroom
    }
    return (
      <Page>
        <Head>
          <title>Platonos</title>
        </Head>
        <div className="container">

          {/* DISPLAY CURRENT USER  */}

          {/* <br/> */}

          {/* CHAT PANEL  */}
          <div className="chat-list">
            { initialChatroom && (initialChat ? 
              <div>
                <h5>Directed</h5>
                <div className="initial-chat" onClick={() => this.goToChatroom(this.props.initialChatroomId)}>
                  <ChatListItem title={initialChat.title} count={initialChat.messages.length} createdAt={initialChat.createdAt} />
                </div>
              </div>
              :
              initialChatroomError ? <div>Error: {initialChatroomError}</div> : null)
            }
            <h5>Latest</h5>
            <ChatList onClickChatroom={this.goToChatroom} />
          </div>
          
          { 
              currentRoomId 
            && 
              <div className="chat-room">
                <Chatroom roomId={currentRoomId} currentUserId={currentUserId} />
              </div> 
            || 
              <div>
                <p>Hi, Welcome to Platonos! This is a place to talk.</p>
                <br />
                <p>Select talkroom or Join to talk</p>
              </div>
          }
        </div>

        <style jsx>{`
          .container {
            display: flex;
            flex: 1;
            height: 100vh;
          }
          .login-button {
            color: blue;
            font-size: 18px;
            font-weight: bold;
          }
    
          .please-login {
            font-size: 14px;
          }

          .new-chat {
            position: fixed;
            left: 110px;
            top: 12px;            
            z-index: 2;
          }

          .chat-list {
            z-index: 1;
            padding-top: 8px;
            flex: 0 0 calc(50vw - 98px);
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
            position: relative;
            border-right: 1px solid rgba(0, 0, 0, .20);
          }

          .chat-room {
            flex: 1
            flex-direction: column;
            min-width: 0;
            padding-left: 12px;
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
          }

          .initial-chat {
            background: #88a;
            margin-bottom: 32px;
            cursor: pointer;
            padding: 8px;
          }
          .initial-chat:hover {
            background: #99f;
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

export default withData(compose(
  graphql(CHATROOM_QUERY, { 
    name: "initialChatroom",
    options: ({ initialChatroomId }) => {
      return {
        variables: {
          roomId: initialChatroomId,
        }
      }
    },
    skip: ({ initialChatroomId }) => {
      return initialChatroomId ? false : true
    }
  }),
)(connectAuth(IndexPage)))
