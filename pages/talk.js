import React, { Component } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'
import NewChat from '../components/NewChat'
import Page from '../layouts/main'
import withData from '../lib/withData'
import connectAuth from '../lib/connectAuth'
import UserChatList from '../components/UserChatList'
import Chatroom from '../components/Chatroom'

class TalkPage extends Component {

  static async getInitialProps({ query }) {
    return { initialChatroomId: query.chatroomId }
  }

  goToChatroom = (id) => {
    Router.push(`/talk?chatroomId=${id}`, `/talk/${id}`, { shallow: true })
  }

  render () {
    const { currentUserId, currentUsername } = this.props
    const currentRoomId = this.props.url.query.chatroomId || this.props.initialChatroomId
    return (
      <Page>
        <Head>
          <title>Platonos</title>
        </Head>
        <div className="container">
        
          {/* NEW CHAT INPUT */}
          <div className="new-chat">
          {currentUsername && <div><b>Hi, {currentUsername}</b></div>}
            {currentUserId ?
              <NewChat onCreateNewChatroom={this.goToChatroom} currentUserId={currentUserId} currentUsername={currentUsername} />            
              :
              <div className="please-join"><Link prefetch href="/join"><a className="join-button">Join</a></Link> to create a chat</div>
            }            
          </div>

          <div className="chat-list">
            <UserChatList 
              forUserId={currentUserId} 
              onClickChatroom={this.goToChatroom} 
              currentRoomId={currentRoomId}
            />
          </div>
          <div className="chat-room">
            {currentRoomId && <Chatroom roomId={currentRoomId} currentUserId={currentUserId} />}
          </div>

        </div>
        <style jsx>{`
          .container {
            display: flex;
            flex: 1;
            height: 100vh;
          }
          .new-chat {
            position: fixed;
            left: 110px;
            top: 12px;            
            z-index: 2;
          }
          .join-button {
            color: blue;
            font-size: 18px;
            font-weight: bold;
          }
    
          .please-join {
            font-size: 14px;
          }
          .chat-list {
            z-index: 1;
            margin-top: 60px;
            padding-top: 8px;
            flex: 0 0 calc(50vw - 98px);
            overflow-y: scroll;
            position: relative;
            border-right: 1px solid rgba(0, 0, 0, .20);
            border-top: 1px solid rgba(0, 0, 0, .20);
          }

          .chat-room {
            flex: 1
            flex-direction: column;
            min-width: 0;
            padding-left: 12px;
          }
        `}</style>
      </Page>
    )
  }
}

export default withData(connectAuth(TalkPage))
