import React, { Component } from 'react'
import { Router } from '../routes'
import PropTypes from 'prop-types'
import { graphql, gql, compose } from 'react-apollo'

import withData from '../lib/withData'
import MessageList from './MessageList'

import Colors from '../utils/Colors'

class Chatroom extends Component {

  static propTypes = {
    roomId: PropTypes.string.isRequired,
    currentUserId: PropTypes.string,
  };

  constructor(props) {
    super(props)
    this.state = {
      textInput: '',
    }
  }

  componentDidMount() {
    if (!process.browser) return
    if (!this.props.chatroomQuery.Chatroom) return
    const chatroom = this.props.chatroomQuery.Chatroom
    const usersInChat = chatroom.users
    const currentUserId = this.props.currentUserId
    const canChat = currentUserId === usersInChat[0].id || currentUserId === usersInChat[1].id    
    if (!canChat) {
      Router.pushRoute(`/chatrooms/${this.props.roomId}`)
    }
  }

  componentWillReceiveProps(nextProps) {
    if(!nextProps.chatroomQuery.loading
      && this.props.chatroomQuery.Chatroom) {

      // Check for existing subscription      
      if (this.unsubscribe) {
        // Check if props have changed and, if necessary, stop the subscription
        if (this.props.roomId !== nextProps.roomId) {
          this.unsubscribe()
          console.log('-> unsubscribe')
        } else {
          console.log('-> same roomId, do nothing')
          return
        }
      }
      // Subscribe
      console.log('...subscribe')
      this.unsubscribe = this.subscribeToNewMessages()
    }
  }

  subscribeToNewMessages = () => {
    return this.props.chatroomMessageQuery.subscribeToMore({
      document: CHATROOM_MESSAGE_SUBSCRIPTION,
      updateQuery: (previous, { subscriptionData }) => {
        const newMessage = subscriptionData.data.Message.node
        const newAllMessages = previous.allMessages.slice()
        newAllMessages[previous.allMessages.length] = newMessage
        const result = {
          ...previous,
          allMessages: newAllMessages
        }
        return result
      }
    })
  }
  
  onCreateMessage = async (e) => {
    if (!confirm("Do you really want to end this chat?")) { return }
    e.preventDefault()
    const { textInput } = this.state
    if (textInput === '') {
      alert('Please type something.')
      return
    }
    try {
      const { createMessageMutation, roomId, currentUserId } = this.props

      const data = await createMessageMutation({
        variables: {
          text: textInput,
          chatroomId: roomId,
          createdByUserId: currentUserId,
        }
      })
      this.setState({
        textInput: ''
      })
    } catch (err) {
      alert("Oops: " + err.graphQLErrors[0].message);
    }
  }

  onEndChatroom = async () => {
    const { roomId, endChatroomMutation } = this.props
    try {
      const data = await endChatroomMutation({
        variables: {
          id: roomId,
        }
      })
    } catch (err) {
      alert("Oops: " + err.graphQLErrors[0].message);
    }
  }

  renderChatroom = (chatroom, messages) => {
    const { currentUserId } = this.props
    const usersInChat = chatroom.users
    const canChat = currentUserId === usersInChat[0].id || currentUserId === usersInChat[1].id
    const isActiveChat = chatroom.stateType === 2

    const chatroomTitle = chatroom.title
    return (
      <div style={{ padding: '0 10px 0 5px' }}>
        <div className="header">
          <div className="button">(save)</div>
          <span></span>
          {canChat && isActiveChat && <div className="end-chat-button" onClick={this.onEndChatroom} >End this chat</div>}
        </div>
        <h2>{chatroomTitle}<span style={{ fontSize: '13px' }}> ({messages.length})</span></h2>
        <p style={{ fontSize: '13px', fontStyle: 'italic' }}>{usersInChat.map(u => u.username).join(', ')}</p>

        <br/>
        
        <MessageList 
          messages={messages} 
          currentUserId={currentUserId} 
          userIds={usersInChat.map(u => u.id)} 
          emptyComponentFunc={() => isActiveChat ?
            <div>Type something, this room is empty 😭</div>
            :
            <div>
              <h3>Please wait</h3>
              <p>We're finding a match around the world...</p>
            </div>}
        />

        {canChat && isActiveChat &&
          <form onSubmit={this.onCreateMessage}>
            <input 
              type="text"
              onChange={(e) => this.setState({ textInput: e.target.value })}
              placeholder="Type here..."
              value={this.state.textInput}
            />
          </form>
        }        
        <style jsx scoped>{`
          .header {
            padding: 15px 0 10px;
            display: flex;
            flex-direction: row;
            {/* flex-direction: row;
            justify-content: flex-end; */}
          }

          .header > span {
            flex-grow: 1;
          }

          .button {
            flex-grow: 0;
            cursor: pointer;
            font-size: 13px;
            font-weight: bold;
          }

          .button:hover {
            background-color: ${Colors.lightGrey};
          }

          .end-chat-button {
            cursor: pointer;
            flex-grow: 0;
            background: #9b3718;
            padding: 4px 8px;
            color: white;
            font-size: 13px;
            font-weight: bold;
            justify-content: flex-end;
          }

          .end-chat-button:hover {
            background: #752615;
          }
        `}</style>
      </div>
    )
  }

  render() {
    console.log('render chatroom')

    const chatroomLoading = this.props.chatroomQuery.loading
    const messagesLoading = this.props.chatroomMessageQuery.loading

    if (chatroomLoading || messagesLoading) return <div>Loading</div>    

    const chatroomError = this.props.chatroomQuery.error
    const messagesError = this.props.chatroomMessageQuery.error
    
    if (chatroomError) return <div>Error: {chatroomError}</div>
    if (messagesError) return <div>Error: {messagesError}</div>

    const messages = this.props.chatroomMessageQuery.allMessages
    const chatroom = this.props.chatroomQuery.Chatroom

    if (!chatroom) return <div>This chatroom does not exist.</div>
    if (chatroom && messages) return this.renderChatroom(chatroom, messages)
    return <div>Something wrong, this shouldn't show.</div>
  }
}

const CHATROOM_QUERY = gql`
  query Chatroom($roomId: ID!) {
    Chatroom(id: $roomId) {
      title
      users {
        id
        username
      }
      createdAt
      stateType
    }
  }
`

const CHATROOM_MESSAGE_QUERY = gql`
  query allMessages($chatroomId: ID!) {
    allMessages(
      filter: {
        chatroom: {
          id: $chatroomId
        }
      }
    ) {
      id
      text
      createdAt
      createdByUserId
    }
  }
`

const CHATROOM_MESSAGE_SUBSCRIPTION= gql`
  subscription onNewMessages {
    Message(
      filter: {
        mutation_in: [CREATED]
      }
    ) {
      node {
        id
        text
        createdAt
        createdByUserId
      }
    }
  }
`

const CREATE_MESSAGE_MUTATION = gql`
  mutation createMessage($text: String!, $chatroomId: ID!, $createdByUserId: String!) {
    createMessage (
      text: $text,
      chatroomId: $chatroomId,
      createdByUserId: $createdByUserId,
    ) {
      id
      text
      createdAt
      createdByUserId
    }
  }
`

const END_CHATROOM_MUTATION = gql`
  mutation endChatroom($id: ID!) {
    updateChatroom(id: $id, stateType: 3) {
      id
    }
  }
`

export default compose(
  graphql(CHATROOM_QUERY, { name: 'chatroomQuery' }),
  graphql(CREATE_MESSAGE_MUTATION, { name: 'createMessageMutation' }),
  graphql(END_CHATROOM_MUTATION, { name: 'endChatroomMutation' }),
  graphql(CHATROOM_MESSAGE_QUERY, { 
    name: 'chatroomMessageQuery', 
    options: (props) => {
      return {
        variables: {
          chatroomId: props.roomId
        }
      }
    }
}),
)(Chatroom)
