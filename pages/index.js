import React, { Component } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'

import connectAuth from '../lib/connectAuth'
import { graphql, gql, compose } from 'react-apollo'

import withData from '../lib/withData'

import Page from '../layouts/main'
import ChatList from '../components/ChatList'
import Chatroom from '../components/Chatroom'

import Colors from '../utils/Colors'

class IndexPage extends Component {

  static async getInitialProps({ query }) {
    // for those who enters from link platonos.com/read/chatroomId
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
    if (this.props.initialChatroomId && id !== this.props.initialChatroomId) {      
      this.setState({
        renderInitialChat: false,
      })
    }
    Router.push(`/?chatroomId=${id}`, `/read/${id}`, { shallow: true })
  }

  render() {    
    // This works after redirect to first page after login
    const { currentUserId } = this.props
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
            <div className="header">
              <h5>Latest <span className="button">(change)</span></h5>
            </div>
            <div style={{ height: '45px' }} />
            <ChatList 
              onClickChatroom={this.goToChatroom} 
              currentRoomId={currentRoomId} 
              initialChatroom={initialChat} />
          </div>
          
          { /* TALK ROOM */
              currentRoomId 
            && 
              <div className="talk-room">
                <Chatroom roomId={currentRoomId} currentUserId={currentUserId} />
              </div>
            || 
              <div className="welcome">
                <h2>Welcome to Platonos!</h2>
                <br />
                <p>Read previous chats here or <Link prefetch href="/join"><a className="join-button">Join</a></Link> to create a chat.</p>
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
            width: calc(50vw - 98px);
            padding: 15px 10px;
            position: fixed;
            background-color: #fff;
            border-bottom: 1px solid #ddd;
            border-right: 1px solid #ddd;
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
            flex: 0 0 calc(50vw - 98px);
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
            position: relative;
            border-right: 1px solid rgba(0, 0, 0, .20);
          }

          .talk-room {
            width: 50vw;
            height: 100vh;
            flex-direction: column;
            min-width: 0;
          }

          .initial-chat {
            color: #fff;
            background: ${Colors.main};
            margin-bottom: 20px;
            cursor: pointer;
          }
          .welcome {
            margin: 8px;
          }
        `}</style>
      </Page>
    )
  }
} 

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
    _messagesMeta {
      count
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
