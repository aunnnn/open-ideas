import React, { Component } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'

import connectAuth from '../lib/connectAuth'
import { graphql, gql, compose } from 'react-apollo'

import withData from '../lib/withData'

import Page from '../layouts/main'
import NewChat from '../components/NewChat'
import ChatList from '../components/ChatList'
import ChatListItem from '../components/ChatListItem'
import Chatroom from '../components/Chatroom'

import Colors from '../utils/Colors'

class IndexPage extends Component {

  static async getInitialProps({ query }) {
    // for those who enters from link platonos.com/chatrooms/chatroomId
    return { initialChatroomId: query.chatroomId }
  }

  constructor(props) {
    super(props)
    this.state = {
      title: '',
      renderInitialChat: true,
    }    
  }

  goToChatroom = (id) => {
    this.setState({
      renderInitialChat: false,
    })
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

          {/* TALK PANEL  */}
          <div className="talk-list">
            { this.state.renderInitialChat && initialChatroom && (initialChat ? 
              <div>
                <div className="header">
                  <h5>Directed</h5>
                </div>
                <div className="initial-chat" onClick={() => this.goToChatroom(this.props.initialChatroomId)}>
                  <ChatListItem
                    title={initialChat.title}
                    count={initialChat.messages.length}
                    createdAt={initialChat.createdAt}
                    active={initialChat.id === currentRoomId}
                  />
                </div>
              </div>
              :
              initialChatroomError ? <div>Error: {initialChatroomError}</div> : null)
            }
            <div className="header">
              <h5>Latest <span className="button">(change)</span></h5>
            </div>
            <ChatList onClickChatroom={this.goToChatroom} currentRoomId={currentRoomId} />
          </div>
          
          { /* TALK ROOM */
              currentRoomId 
            && 
              <div className="talk-room">
                <Chatroom roomId={currentRoomId} currentUserId={currentUserId} />
              </div>
            || 
              <div>
                <p>Hi, Welcome to Platonos! This is a place to talk.</p>
                <br />
                <p>Select talkroom to read or <Link prefetch href="/join"><a className="join-button">Join</a></Link> to talk.</p>
              </div>
          }
        </div>

        <style jsx scoped>{`
          .container {
            display: flex;
            flex: 1;
            height: 100vh;
          }
          .join-button {
            color: blue;
            font-size: 18px;
            font-weight: bold;
          }
          .header {
            padding: 10px;
          }
          .header h5 {
            font-weight: 400;
          }
          .header .button {
            font-weight: bold;
            cursor: pointer;
          }
          .header .button:hover {
            background-color: ${Colors.lightGrey};
          }
          .please-join {
            font-size: 14px;
          }

          .new-chat {
            position: fixed;
            left: 110px;
            top: 12px;            
            z-index: 2;
          }

          .talk-list {
            z-index: 1;
            padding-top: 8px;
            flex: 0 0 calc(50vw - 98px);
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
            position: relative;
            border-right: 1px solid rgba(0, 0, 0, .20);
          }

          .talk-room {
            flex: 1
            flex-direction: column;
            min-width: 0;
            padding-left: 12px;
            padding-top: 8px;
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
          }

          .initial-chat {
            color: #fff;
            background: ${Colors.main};
            margin-bottom: 20px;
            cursor: pointer;
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

const CHATROOM_QUERY = gql`
query Chatroom($roomId: ID!) {
  Chatroom(id: $roomId) {
    id
    title
    users {
      id
      username
    }
    messages {
      id
      text
      createdAt
      createdByUserId
    }
    createdAt
    stateType
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
