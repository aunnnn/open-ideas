import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql, gql, compose } from 'react-apollo'
import findIndex from 'lodash/findIndex'
import some from 'lodash/some'

import { CHATROOM_STATE_TYPES } from '../constants'

import { Router } from '../routes'
import withData from '../lib/withData'
import MessageList from './MessageList'

import Colors from '../utils/Colors'

import { FIRSTLOAD_CHATROOMS_QUERY } from './ChatList'
import { FIRSTLOAD_USER_CHATROOMS_QUERY } from './UserChatList'
import UserChatroomFragment from '../graphql/UserChatroomFragment'

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
    if (!process.browser) return

    if(!nextProps.chatroomQuery.loading
      && nextProps.chatroomQuery.Chatroom) {
      // Check for existing subscription      
      if (this.unsubscribe) {
        // Check if props have changed and, if necessary, stop the subscription
        if (this.props.chatroomQuery.Chatroom.id !== nextProps.chatroomQuery.Chatroom.id) {
          this.unsubscribe()
          // console.log('-> unsubscribe from ', this.props.chatroomQuery.Chatroom.title)
        } else {
          // console.log('-> same roomId, do nothing')
          return
        }
      }
      // Subscribe
      // console.log('...subscribe messages of', nextProps.chatroomQuery.Chatroom.id, `(${nextProps.chatroomQuery.Chatroom.title})`)
      this.unsubscribe = this.subscribeToNewMessages(nextProps.chatroomQuery.Chatroom.id)
    }
  }

  subscribeToNewMessages = (roomId) => {
    return this.props.chatroomMessageQuery.subscribeToMore({
      document: CHATROOM_MESSAGE_SUBSCRIPTION,
      variables: {
        chatroomId: roomId,
      },
      onError: (err) => console.error(err),
      updateQuery: (previous, { subscriptionData }) => {
        const newMessage = subscriptionData.data.Message.node
        if (some(previous.allMessages, { id: newMessage.id })) {
          return previous
        }
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
          updatedAt: new Date(),
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
    if (!confirm("Do you really want to end this chat?")) { return }
    const { roomId, endChatroomMutation, currentUserId } = this.props
    try {
      const data = await endChatroomMutation({
        variables: {
          id: roomId,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateChatroom: {
            __typename: 'Chatroom',
            id: roomId,
          }
        },
        update: (store, { data: { updateChatroom } }) => {
          function updateChatroomsQuery (query, variables) {
            try {
              // User chatlist
              // 1. read from store
              const userChatroomsData = store.readQuery({
                query,
                variables,
              })
  
              // 2. update state
              const endedChatroomIndex = findIndex(userChatroomsData.allChatrooms, c => c.id === updateChatroom.id)
              userChatroomsData.allChatrooms[endedChatroomIndex].stateType = CHATROOM_STATE_TYPES.closed
  
              // 3. write back
              store.writeQuery({
                query,
                data: userChatroomsData,
                variables,
              })
            } catch (err) {            
              // console.error('Error: ', err)
            }
          }

          // One between this may get error,
          //  e.g., user has not visited 'Talk' page yet, so there's no query, and readQuery throw.
          updateChatroomsQuery(FIRSTLOAD_USER_CHATROOMS_QUERY, {
            forUserId: currentUserId,
          })
          updateChatroomsQuery(FIRSTLOAD_CHATROOMS_QUERY)

          try {
            // Update cache so that the Chatroom component is rerendered to reflect change. (e.g., no input type, no endchat button, etc.)
            const data = store.readQuery({
              query: CHATROOM_QUERY,
              variables: {
                roomId,
              }
            })

            data.Chatroom.stateType = CHATROOM_STATE_TYPES.closed

            store.writeQuery({
              query: CHATROOM_QUERY,
              data,
              variables: {
                roomId,
              }
            })
          } catch (err) {
            console.error('Error: ', err)
          }
        },
      })
    } catch (err) {
      alert("Oops: " + err.graphQLErrors[0].message);
    }
  }
  
  emptyMessageComponent = (stateType) => {
    const chatroom = this.props.chatroomQuery.Chatroom
    if (!chatroom) return <div>...Loading...</div>
    switch (chatroom.stateType) {
    case CHATROOM_STATE_TYPES.created:
      return <div>We're looking for a match....</div>
    
    case CHATROOM_STATE_TYPES.invited:
      return <div>Your match is already invited.</div>
    case CHATROOM_STATE_TYPES.active:
      return <div>This room is empty.</div>
    case CHATROOM_STATE_TYPES.closed:
      return <div>This room is closed and empty 😭</div>
    default: 
      return <div>This room is empty.</div>
    }
  }

  renderChatroom = (chatroom, messages) => {
    const { currentUserId } = this.props
    const usersInChat = chatroom.users
    const canChat = currentUserId === usersInChat[0].id || currentUserId === usersInChat[1].id
    const isActiveChat = chatroom.stateType === CHATROOM_STATE_TYPES.active

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
          emptyComponentFunc={this.emptyMessageComponent}
          authorId={chatroom.createdBy.id}
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
    const chatroomLoading = this.props.chatroomQuery.loading
    const messagesLoading = this.props.chatroomMessageQuery.loading

    const chatroomError = this.props.chatroomQuery.error
    const messagesError = this.props.chatroomMessageQuery.error
    
    if (chatroomError) return <div>Error: {chatroomError}</div>
    if (messagesError) return <div>Error: {messagesError}</div>

    const messages = this.props.chatroomMessageQuery.allMessages
    const chatroom = this.props.chatroomQuery.Chatroom

    if ((chatroomLoading && !chatroom) || (messagesLoading && !messages)) return <div>Loading</div>    

    if (!chatroom) return <div>This chatroom does not exist.</div>
    if (chatroom && messages) return this.renderChatroom(chatroom, messages)
    return <div>Something wrong, this shouldn't show.</div>
  }
}

const CHATROOM_QUERY = gql`
  query Chatroom($roomId: ID!) {
    Chatroom(id: $roomId) {
      ...UserChatroom
      users {
        id
        username
      }
    }
  }

  ${UserChatroomFragment}
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
  subscription onNewMessages($chatroomId: ID!) {
    Message(
      filter: {
        mutation_in: [CREATED],
        node: {
          chatroom: {
            id: $chatroomId
          }
        }        
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
  mutation createMessage($text: String!, $chatroomId: ID!, $createdByUserId: String!, $updatedAt: DateTime!) {
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

    updateChatroom(id: $chatroomId, latestMessagesAt: $updatedAt) {
      id
    }
  }
`

const END_CHATROOM_MUTATION = gql`
  mutation endChatroom($id: ID!) {
    updateChatroom(id: $id, stateType: ${CHATROOM_STATE_TYPES.closed}) {
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
        },
        pollInterval: 20000,
      }
    }
}),
)(Chatroom)
