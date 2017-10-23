import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql, gql, compose } from 'react-apollo'
import findIndex from 'lodash/findIndex'
import some from 'lodash/some'

import { CHATROOM_STATE_TYPES } from '../constants'

import { Router } from '../routes'
import MessageList from './MessageList'

import Colors from '../utils/Colors'

import { FIRSTLOAD_CHATROOMS_QUERY } from './ChatList'
import { FIRSTLOAD_USER_CHATROOMS_QUERY } from './UserChatList'
import ChatroomEmptyMessage from './ChatroomEmptyMessage'
import UserChatroomFragment from '../graphql/UserChatroomFragment'
import CHATROOM_STATETYPE_MUTATION from '../graphql/ChatroomStateTypeMutation'
import CURRENT_USER_QUERY from '../graphql/UserQuery'

class Chatroom extends Component {

  static propTypes = {
    roomId: PropTypes.string.isRequired,
    currentUserId: PropTypes.string,
    talkMode: PropTypes.bool.isRequired,
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
    if (!canChat && this.props.talkMode) {
      Router.pushRoute(`/read/${this.props.roomId}`)
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

      await createMessageMutation({
        variables: {
          text: textInput,
          chatroomId: roomId,
          createdByUserId: currentUserId,
          updatedAt: (new Date()).toISOString(),
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
      await endChatroomMutation({
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
              console.error('Error: ', err)
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

  onSaveOrRemoveChatroom = async (isSave) => {
    if (!confirm(isSave ? "Save this talk? You can view all saved talks at Profile." : "Remove this talk?")) return
    const { roomId, currentUserId } = this.props
    try {
      const targetFunc = isSave ? this.props.saveChatroomMutation : this.props.removeFromSavedChatroomsMutation
      await targetFunc({
        variables: {
          userId: currentUserId,
          chatroomId: roomId,
        },
        refetchQueries: [
          {
            query: CURRENT_USER_QUERY,
            variables: {
              userId: currentUserId,
            }
          },
          {
            query: CHATROOM_QUERY,
            variables: {
              roomId
            },
          }
        ]
      })
    } catch (err) {
      alert("Oops: " + err.graphQLErrors[0].message);
    }
  }

  renderChatroom = (chatroom, messages) => {
    const { currentUserId } = this.props
    const usersInChat = chatroom.users
    const canChat = chatroom.stateType === CHATROOM_STATE_TYPES.active && (currentUserId === usersInChat[0].id || currentUserId === usersInChat[1].id)
    const isActiveChat = chatroom.stateType === CHATROOM_STATE_TYPES.active
    const isClosedChat = chatroom.stateType === CHATROOM_STATE_TYPES.closed
    const chatroomTitle = chatroom.title
    const isSavedByCurrentUser = chatroom.savedByUsers.map(u => u.id).indexOf(currentUserId) > -1
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div className="header-wrapper">
          <div className="header">
            <div className={`button ${isSavedByCurrentUser ? 'remove-button' : 'save-button'}`} onClick={() => this.onSaveOrRemoveChatroom(!isSavedByCurrentUser)}>{isSavedByCurrentUser? 'remove' : 'save' }</div>
            {canChat && isActiveChat && <div className="end-chat-button" onClick={this.onEndChatroom} >(End this chat)</div>}
          </div>
          <h2>{chatroomTitle}<span style={{ fontSize: '13px' }}> ({messages.length})</span></h2>
          <p style={{ fontSize: '13px', fontStyle: 'italic' }}>{usersInChat.map(u => u.username).join(', ')}</p>
        </div>
        
        <div className="message-wrapper">
          {
            messages.length === 0 ?
              <ChatroomEmptyMessage 
                currentUserId={currentUserId}
                chatroom={chatroom} 
              />
              :
              <MessageList 
                messages={messages} 
                currentUserId={currentUserId} 
                userIds={usersInChat.map(u => u.id)} 
                authorId={chatroom.createdBy.id}
                isClosed={isClosedChat}
              />   
          }
        </div>

        {canChat && isActiveChat &&
          <form onSubmit={this.onCreateMessage} className="input-wrapper" ref={(form) => { this.inputForm = form; }}>
            <textarea
              className="input"
              type="text"
              onChange={(e) => this.setState({ textInput: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (!e.shiftKey && !e.altKey) {
                    this.onCreateMessage(e)
                  } else if (e.altKey) {
                    this.setState(prev => ({ textInput: prev.textInput + '\n' }))
                  }
                }
              }}
              placeholder="Type here..."
              value={this.state.textInput}
            />
          </form>
        }        
        <style jsx scoped>{`
          .header-wrapper {
            flex-shrink: 0;
            padding: 0 10px 10px;
          }
          .message-wrapper {
            padding: 10px;
            flex: 1 1 auto;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
          }
          .input-wrapper {
            flex: 0 0 15vh;
            border-top: 1px solid #ddd;
          }
          .input {
            resize: none;
            border: 0;
            font-family: monospace;
            padding: 10px;
            font-size: 16px;
            width: 100%;
            height: 15vh;
          }
          .input:focus {
            outline: none;
          }
          .header {
            padding: 5px 0;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
          }

          .button {
            flex-grow: 0;
            cursor: pointer;
            font-size: 13px;
            font-weight: bold;
            margin-right: 5px;
            padding: 4px 8px;
            color: white;
            font-size: 13px;
            font-weight: bold;
          }

          .save-button {
            background: ${Colors.main};
          }

          .remove-button {
            background: gray;
          }

          .save-button:hover {
            background: #752615;
          }

          .remove-button:hover {
            opacity: 0.8;
          }


          .end-chat-button {
            cursor: pointer;
            flex-grow: 0;
            font-size: 13px;
            font-weight: bold;
          }

          .end-chat-button:hover {
            background-color: ${Colors.lightGrey};
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
    
    if (chatroomError) { 
      return <div>Error: {chatroomError}</div> 
    }
    if (messagesError) {
      return <div>Error: {messagesError}</div>
    }
    const messages = this.props.chatroomMessageQuery.allMessages
    const chatroom = this.props.chatroomQuery.Chatroom

    if (chatroomLoading) return <div>Loading chatroom...</div>
    if ((chatroomLoading && !chatroom) || (messagesLoading && !messages)) return <div>Loading</div>    

    if (!chatroom) return <div>This chatroom does not exist.</div>
    // E.g., someone may remember room id and put it directly in the url, we must check it here that it's active/closed.
    const isPrivateChat = (chatroom.stateType !== CHATROOM_STATE_TYPES.active && chatroom.stateType !== CHATROOM_STATE_TYPES.closed)
    const currentUserCanView = this.props.currentUserId && some(chatroom.users, { id: this.props.currentUserId })
    if (isPrivateChat && !currentUserCanView) return <div>This chatroom is not available for public yet.</div>
    if (chatroom && messages) return this.renderChatroom(chatroom, messages)
    return <div>Something wrong, this shouldn't show.</div>
  }
}

export const CHATROOM_QUERY = gql`
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

const SAVE_CHATROOM_MUTATION = gql`
  mutation saveChatroom($userId: ID!, $chatroomId: ID!) {
    addToUserSavedChatrooms(
      savedByUsersUserId: $userId,
      savedChatroomsChatroomId: $chatroomId,
    ) {
      savedByUsersUser {
        id
      }
    }
  }
`

const REMOVE_FROM_SAVED_CHATROOM_MUTATION = gql`
  mutation removeChatroom($userId: ID!, $chatroomId: ID!) {
    removeFromUserSavedChatrooms(
      savedByUsersUserId: $userId, 
      savedChatroomsChatroomId: $chatroomId
    ) {
      savedByUsersUser {
        id
      }
    }
  }
`

export default compose(
  graphql(CHATROOM_QUERY, { name: 'chatroomQuery' }),
  graphql(CREATE_MESSAGE_MUTATION, { name: 'createMessageMutation' }),
  graphql(SAVE_CHATROOM_MUTATION, { name: 'saveChatroomMutation' }),
  graphql(REMOVE_FROM_SAVED_CHATROOM_MUTATION, { name: 'removeFromSavedChatroomsMutation' }),
  graphql(CHATROOM_STATETYPE_MUTATION(CHATROOM_STATE_TYPES.closed), { name: 'endChatroomMutation' }),
  graphql(CHATROOM_MESSAGE_QUERY, { 
    name: 'chatroomMessageQuery',     
    options: (props) => {
      return {
        variables: {
          chatroomId: props.roomId
        },
        pollInterval: 15000,
      }
    }
}),
)(Chatroom)
