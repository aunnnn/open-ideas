import React, { Component } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'
import moment from 'moment'

import connectAuth from '../lib/connectAuth'
import { graphql, gql, compose } from 'react-apollo'

import withData from '../lib/withData'

import Page from '../layouts/main'
import ChatList from '../components/ChatList'
import Chatroom from '../components/Chatroom'
import WelcomeJumpbotron from '../components/WelcomeJumbotron'

import Colors from '../utils/Colors'
import { chatroomIDFromSlug } from '../utils/misc'

class IndexPage extends Component {

  static async getInitialProps({ query }) {
    // for those who enters from link platonos.com/read/chatroomId
    const chatroomId = query.slug ? chatroomIDFromSlug(query.slug) : null
    return { 
      initialChatroomId: chatroomId,
      slug: query.slug,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      title: '',
      renderInitialChat: true,
      sortedBy: 'new',
    }    

    this.onSortedByNew = this.onSortedBy('new')
    this.onSortedByUpdated = this.onSortedBy('updated')
    this.onSortedByMessages = this.onSortedBy('#messages')
  }

  goToChatroom = (slug) => {
    if (this.props.slug && slug !== this.props.slug) {      
      this.setState({
        renderInitialChat: false,
      })
    }
    Router.push(`/?slug=${slug}`, `/read/${slug}`, { shallow: true })
  }

  onSortedBy = (sortedBy) => (e) => {
    e.preventDefault()
    this.setState({
      sortedBy,
    })
  }

  sortedByToGraphQLOrderBy = (sortedBy) => {
    let sortedByToGraphQLOrderBy;
    switch (sortedBy) {
      case 'new': 
        sortedByToGraphQLOrderBy = 'createdAt_DESC'
        break
      case 'updated': 
        sortedByToGraphQLOrderBy = 'updatedAt_DESC'
        break
      case '#messages': 
        sortedByToGraphQLOrderBy = 'estimatedMessagesCount_DESC'
        break
      default: sortedByToGraphQLOrderBy = 'createdAt_DESC'
    }
    return sortedByToGraphQLOrderBy
  }

  getDisplayDateOnChatList = (chat) => {
    const sortedBy = this.state.sortedBy
    switch (sortedBy) {
      case 'new': 
        return moment(chat.createdAt).fromNow()
      case 'updated': 
        return `Updated: ${moment(chat.updatedAt).fromNow()}`
      case '#messages': 
        return moment(chat.createdAt).fromNow()
      default: 
        return null
    }
  }

  render() {    
    // This works after redirect to first page after login
    const { currentUserId, currentUsername } = this.props
    const { sortedBy } = this.state
    
    const currentRoomId = this.props.url.query.slug ? chatroomIDFromSlug(this.props.url.query.slug) : null

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
              <div className="left-pane">
                <span 
                  className={`button ${sortedBy === 'new' && 'active'}`} 
                  onClick={this.onSortedByNew}>new</span>|
                <span 
                  className={`button ${sortedBy === 'updated' && 'active'}`}
                  onClick={this.onSortedByUpdated}>updated</span>|
                <span 
                  className={`button ${sortedBy === '#messages' && 'active'}`}
                  onClick={this.onSortedByMessages}
                  >#messages</span>
              </div>
              {/* <div className="right-pane">
                <p>refresh</p>
              </div> */}
            </div>
            <div style={{ height: '45px' }} />
            <ChatList 
              onClickChatroom={this.goToChatroom} 
              currentRoomId={currentRoomId} 
              initialChatroom={initialChat} 
              sortedBy={this.sortedByToGraphQLOrderBy(sortedBy)}
              dateDisplayFunction={this.getDisplayDateOnChatList}
            />
          </div>
          
          { /* TALK ROOM */
              currentRoomId 
            && 
              <div className="talk-room">
                <Chatroom roomId={currentRoomId} currentUserId={currentUserId} talkMode={false} />
              </div>
            || 
              <div style={{ margin: '8px' }}>
                {/* <WelcomeJumpbotron /> */}
                <h2>Welcome to Platonos{currentUsername && `, ${currentUsername}`}!</h2>
                <br/>
                {
                  currentUsername ? 
                  <div>
                    <p>Select a talk to read.</p>
                  </div>
                  :
                  <div>
                    <p>Read talks here or <Link prefetch href="/join"><a className="join-button">Join</a></Link> to create a talk.</p>
                  </div>
                }
                <div id="what-is-platonos">
                  <h3>What is Platonos?</h3>
                  <br/>
                  <p>
                    Platonos finds a random user for you to discuss on a topic you create.
                    <br/><br/>
                    All talks are public and everyone is anonymous.
                    <br/><br/>
                    <Link prefetch href="/about"><a className="about-button">Learn more</a></Link>
                  </p>
                  <p></p>
                </div>
              </div>
          }
        </div>

        <style jsx>{`
          .container {
            display: flex;
            flex: 1;
            height: 100vh;
          }
          #what-is-platonos {
            margin-top: 60px;
          }
          .join-button {
            color: blue;
            font-size: 18px;
            font-weight: bold;
          }
          .about-button {
            color: #444444;
            text-decoration: underline;
          }
          .header {
            width: calc(50vw - 98px);
            padding: 15px 10px;
            position: fixed;
            background-color: #fff;
            border-bottom: 1px solid #ddd;
            border-right: 1px solid #ddd;
            display: flex;
            flex-direction: row;
            align-items: center;
          }
          .header h5 {
            font-weight: 400;
          }
          .header .button {
            font-size: 16px;
            cursor: pointer;
            margin: 0 4px;
            color: gray;
          }
          .header .button:hover {
            background-color: ${Colors.lightGrey};
          }
          .header .button.active {
            font-weight: bold;
            color: black;
          }
          .please-join {
            font-size: 14px;
          }

          .header .left-pane {
            flex-grow: 1;
          }

          .right-pane {
            cursor: pointer;
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
