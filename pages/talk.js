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
import { chatroomIDFromSlug } from '../utils/misc'

class TalkPage extends Component {

  static async getInitialProps({ query }) {
    const chatroomId = query.slug ? chatroomIDFromSlug(query.slug) : null
    return { 
      initialChatroomId: chatroomId,
      slug: query.slug,
    }
  }

  goToChatroom = (slug) => {
    Router.push(`/talk?slug=${slug}`, `/talk/${slug}`, { shallow: true })
  }

  render () {
    const { currentUserId, currentUsername } = this.props
    const currentRoomId = this.props.url.query.slug ? chatroomIDFromSlug(this.props.url.query.slug) : null
    return (
      <Page>
        <Head>
          <title>Platonos</title>
        </Head>
        <div className="container">
        
          {/* NEW CHAT INPUT */}
          <div className="new-chat">
            {currentUserId ?
              <NewChat onCreateNewChatroom={this.goToChatroom} currentUserId={currentUserId} currentUsername={currentUsername} />            
              :
              <div className="please-join"><Link prefetch href="/join"><a className="join-button">Join</a></Link> to create a talk</div>
            }            
          </div>

          <div className="talk-list">
            <UserChatList 
              forUserId={currentUserId} 
              onClickChatroom={this.goToChatroom} 
              currentRoomId={currentRoomId}
            />
          </div>
          <div className="talk-room">
            {currentRoomId ? <Chatroom roomId={currentRoomId} currentUserId={currentUserId} talkMode />
            :
            <div style={{ margin: '8px' }}>
             {
               currentUsername ?
               <div>
                 <h2>Your Talks, {currentUsername}.</h2> 
                 <br/>
                 <p>Select a talk to read, or create a new one.</p>
               </div>
               :
               <div>
                 <h2>Welcome to Platonos!</h2> 
                 <p>You can view your talks and create a talk here after login. <Link prefetch href="/join"><a className="join-button">Join</a></Link></p>
               </div>
             }
            </div>}
          </div>

        </div>
        <style jsx>{`
          .container {
            display: flex;
            flex: 1;
            height: 100vh;
          }
          .new-chat {
            width: calc(50vw - 98px);
            background-color: #fff;
            height: 64px;
            padding: 12px 4px 4px 4px;
            position: fixed;      
            z-index: 2;
            border-right: 1px solid #ddd;
          }
          .join-button {
            color: blue;
            font-size: 18px;
            font-weight: bold;
          }
    
          .please-join {
            font-size: 14px;
            margin: 8px;
          }
          .talk-list {
            z-index: 1;
            margin-top: 64px;
            flex: 0 0 calc(50vw - 98px);
            overflow-y: auto;
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
        `}</style>
      </Page>
    )
  }
}

const WithAuth = connectAuth(TalkPage)
export default withData(WithAuth)
