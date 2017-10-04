import React, { Component } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import NewChat from '../components/NewChat'
import Page from '../layouts/main'
import withData from '../lib/withData'
import connectAuth from '../lib/connectAuth'

class TalkPage extends Component {
  render () {
    const { currentUserId, currentUsername } = this.props
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
