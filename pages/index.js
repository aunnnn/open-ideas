import React, { Component } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'

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
    Router.push(`/?chatroomId=${id}`, `/chatrooms/${id}`, { shallow: true })
  }

  render() {
    // This works after redirect to first page after login
    const { currentUserId, currentUsername } = this.state
    const currentRoomId = this.props.url.query.chatroomId || this.props.initialChatroomId

    const initialChatroom = this.props.initialChatroom
    let initialChatroomLoading, initialChatroomError, initialChat
    if (initialChatroom) {
      initialChatroomLoading = initialChatroom.loading
      initialChatroomError = initialChatroom.error
      initialChat = initialChatroom.Chatroom
    }
    return (
      <Page style={{ overflow: 'auto' }}>
        <Head>
          <title>Platonos</title>
        </Head>
        <div className="container">

          {/* DISPLAY CURRENT USER  */}
          {currentUsername && <div><b>Hi, {currentUsername}</b></div>}

          {/* NEW CHAT INPUT */}
          {currentUserId ?
            <NewChat onCreateNewChatroom={this.goToChatroom} currentUserId={currentUserId} />
            :
            <div className="please-login"><Link prefetch href="/join"><a className="login-button">Login</a></Link> to create a chat</div>
          }

          <br/>

          {/* CHAT PANEL  */}
          <div className="chat-container">
            <div className="left">
              { initialChatroom && (initialChat ? 
                <div>
                  <h4>Directed</h4>
                  <div className="initial-chat" onClick={() => this.goToChatroom(this.props.initialChatroomId)}>
                    <ChatListItem title={initialChat.title} count={initialChat.messages.length} createdAt={initialChat.createdAt} />
                  </div>
                </div>
                :
                initialChatroomError ? <div>Error: {initialChatroomError}</div> : <div>Loading</div>)
              }
              { initialChatroom && <h4>Latest</h4> }
              <ChatList onClickChatroom={this.goToChatroom} />
            </div>
            
            { 
                currentRoomId 
              && 
                <div className="right">
                  <Chatroom roomId={currentRoomId} currentUserId={currentUserId} />
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
  graphql(CURRENT_USER_QUERY, { name: "currentUserQuery" }),
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
)(IndexPage))
