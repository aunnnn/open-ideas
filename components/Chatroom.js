import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql, gql, compose } from 'react-apollo'

import withData from '../lib/withData'
import MessageList from './MessageList'

class Chatroom extends Component {
  constructor(props) {
    super(props)
    this.state = {
      textInput: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    if(!nextProps.chatroomMessageQuery.loading) {

      console.log('params', this.props.roomId, 'and', nextProps.roomId)
      // Check for existing subscription      
      if (this.unsubscribe) {
        // Check if props have changed and, if necessary, stop the subscription
        if (this.props.roomId !== nextProps.roomId) {
          this.unsubscribe();
          console.log('-> unsubscribe')
        } else {
          console.log('-> same roomId, do nothing')
          return;
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
    e.preventDefault()
    try {
      const { createMessageMutation, roomId, currentUserId } = this.props

      const data = await createMessageMutation({
        variables: {
          text: this.state.textInput,
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

  render() {
    const { chatroomQuery: { loading, error }, chatroomMessageQuery, roomId, currentUserId } = this.props

    if (loading || chatroomMessageQuery.loading) return <div>Loading</div>
    console.log('render chatroom')
    
    const messages = chatroomMessageQuery.allMessages
    const chatroom = this.props.chatroomQuery.Chatroom
    const usersInChat = chatroom.users
    const canChat = currentUserId === usersInChat[0].id || currentUserId === usersInChat[1].id
    
    if (error) return <div>Error: {error}</div>
    if (chatroom) {
      return (
        <div>        
          <h2>{chatroom.title}<span style={{ fontSize: '13px' }}> ({messages.length})</span></h2>
          <p style={{ fontSize: '13px', fontStyle: 'italic' }}>{usersInChat.map(u => u.username).join(', ')}</p>
  
          <br/>
          
          <MessageList messages={messages} currentUserId={currentUserId} userIds={usersInChat.map(u => u.id)} />

          {canChat &&
            <form onSubmit={this.onCreateMessage}>
              <input 
                type="text"
                onChange={(e) => this.setState({ textInput: e.target.value })}
                placeholder="Type here..."
                value={this.state.textInput}
              />
            </form>
          }
        </div>
      )
    }
    return <div>Loading</div>
  }
}

Chatroom.propTypes = {
  roomId: PropTypes.string.isRequired,
};

const CHATROOM_QUERY = gql`
  query Chatroom($roomId: ID!) {
    Chatroom(id: $roomId) {
      title
      messages {
        id
        text
        createdAt
        createdByUserId
      }
      users {
        id
        username
      }
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
export default compose(
  graphql(CHATROOM_QUERY, { name: 'chatroomQuery' }),
  graphql(CREATE_MESSAGE_MUTATION, { name: 'createMessageMutation' }),
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
