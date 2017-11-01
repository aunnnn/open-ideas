import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql, gql, compose } from 'react-apollo'
import findIndex from 'lodash/findIndex'
import some from 'lodash/some'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

import { CHATROOM_STATE_TYPES } from '../constants'

import { Router } from '../routes'
import MessageList from './MessageList'
import MessageListItem from './MessageListItem'

import Colors from '../utils/Colors'
import { insert_anchor } from '../utils/transform';

import { FIRSTLOAD_CHATROOMS_QUERY } from './ChatList'
import { FIRSTLOAD_USER_CHATROOMS_QUERY } from './UserChatList'
import ChatroomEmptyMessage from './ChatroomEmptyMessage'
import UserChatroomFragment from '../graphql/UserChatroomFragment'
import CHATROOM_STATETYPE_MUTATION from '../graphql/ChatroomStateTypeMutation'
import CURRENT_USER_QUERY from '../graphql/UserQuery'

import {
  CREATE_MESSAGE_MUTATION,
  SAVE_CHATROOM_MUTATION,
  UPDATE_AUTHOR_TYPING_MUTATION,
  UPDATE_MATCH_TYPING_MUTATION,
  REMOVE_FROM_SAVED_CHATROOM_MUTATION,

  CHATROOM_MESSAGE_SUBSCRIPTION,
  CHATROOM_PARTICIPANT_TYPING_SUBSCRIPTION,
  CHATROOM_PUBLIC_TYPING_SUBSCRIPTION,
} from '../graphql/ChatroomMutations'

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
      mutatingSavedTalk: false,
      isAuthorTyping: false,
      isMatchTyping: false,
    }

    // #######################
    // # Typing... Indicator
    // #######################
    //
    // 1. We focus on (throttled) typing signal, then let client interpret showing/hiding. 
    //    It's reliable than totally check the show/hide value via WebSocket.
    //
    //    NOTE: When a user submit message, we will cancel all debounce/throttle receiving mechanism then hide typing... immediately.
    this._emitStartTyping = throttle(this.emitStartTyping, 1200)
    this._emitStopTyping = debounce(this.emitStopTyping, 2000)

    // 2.1 If client receive more typing signals in 1.3s --> show typing ...
    this.start_locallyReflectTyping = debounce(this.locallyReflectTyping(true), 1300, {
      leading: true,
    })

    // 2.2 If client doesn't receive more typing signals in 2.0s --> hide typing...
    this.stop_locallyReflectTyping = debounce(this.locallyReflectTyping(false), 2000)

    // Public
    // Just hide all if we don't receive any signals for 2s
    this.stop_locallyReflectTypingForPublic = debounce(this.locallyReflectTypingForPublic, 2000)
  }

  componentDidMount() {
    // If not participants & comes through talk page => redirect to /read/
    if (!this.props.canChat && this.props.talkMode) {
      Router.pushRoute(`/read/${this.props.roomId}`)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!process.browser) return

    if(!nextProps.chatroomQuery.loading
      && nextProps.chatroomQuery.Chatroom) {
      // Check for existing subscription      
      if (this.unsubscribeNewMessages && this.unsubscribeTypingUsers) {
        // Check if props have changed and, if necessary, stop the subscription
        if (this.props.chatroomQuery.Chatroom.id !== nextProps.chatroomQuery.Chatroom.id) {
          this.setState({
            textInput: '',
          })

          this.unsubscribeNewMessages()
          this.unsubscribeTypingUsers()
        } else {
          return
        }
      }
      const chatroom = nextProps.chatroomQuery.Chatroom
      const chatroomId = chatroom.id
      const authorId = chatroom.createdBy.id
      const currentUserId = nextProps.currentUserId

      // Subscribe
      if (chatroom.stateType === CHATROOM_STATE_TYPES.active) {
        this.unsubscribeNewMessages = this.subscribeToNewMessages(chatroomId)
        this.unsubscribeTypingUsers = this.subscribeToTypingUsers(chatroomId, authorId, currentUserId, nextProps.canChat)
      }
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

        this.locallyReflectTyping(false)(true)
        this.locallyReflectTyping(false)(false)

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
  
  subscribeToTypingUsers = (roomId, createdByUserId, currentUserId, canChat) => {
    let sub;
    if (canChat) {
      // talking mode

      // not author -> listening to author
      const listeningToAuthorTyping = createdByUserId !== currentUserId

      sub = this.props.chatroomQuery.subscribeToMore({

        // Listening to another participant only
        document: CHATROOM_PARTICIPANT_TYPING_SUBSCRIPTION(listeningToAuthorTyping),
        variables: {
          chatroomId: roomId,
        },
        updateQuery: (previous, { subscriptionData }) => { 
          if (listeningToAuthorTyping) {
            if (subscriptionData.data.Chatroom.node.isAuthorTyping) {
              // received typing true
              this.start_locallyReflectTyping(true)
              this.stop_locallyReflectTyping(true)
            } else {
              // *received typing false --> force STOP
              this.start_locallyReflectTyping.cancel()
              this.stop_locallyReflectTyping.cancel()
              this.locallyReflectTyping(false)(true)
            }
          } else {
            if (subscriptionData.data.Chatroom.node.isMatchTyping) {
              this.start_locallyReflectTyping(false)
              this.stop_locallyReflectTyping(false)            
            } else {
              this.start_locallyReflectTyping.cancel()
              this.stop_locallyReflectTyping.cancel()
              this.locallyReflectTyping(false)(false)
            }
          }
          return previous
        }
      })
    } else {
      // public mode
      sub = this.props.chatroomQuery.subscribeToMore({
        document: CHATROOM_PUBLIC_TYPING_SUBSCRIPTION,
        variables: {
          chatroomId: roomId,
        },
        updateQuery: (previous, { subscriptionData }) => { 
          const isAuthorTyping = subscriptionData.data.Chatroom.node.isAuthorTyping
          const isMatchTyping = subscriptionData.data.Chatroom.node.isMatchTyping

          // For public: just reflect realtime, directly
          this.locallyReflectTypingForPublic(isAuthorTyping, isMatchTyping)
          
          // If not receive anymore, just hide all
          this.stop_locallyReflectTypingForPublic(false, false)
          return previous
        }
      })
    }
    return sub
  }

  locallyReflectTyping = (isTyping) => (isAuthor) => {
    if (isAuthor) {
      this.setState({
        isAuthorTyping: isTyping,
      })
    } else {
      this.setState({
        isMatchTyping: isTyping,
      })
    }
  }

  locallyReflectTypingForPublic = (isAuthorTyping, isMatchTyping) => {
    this.setState({
      isAuthorTyping,
      isMatchTyping,
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
      const { createMessageMutation, roomId, currentUserId, chatroomQuery } = this.props

      if (!chatroomQuery.Chatroom) {
        alert('Please wait...')
        return
      }

      const estimatedMessagesCount = chatroomQuery.Chatroom._messagesMeta.count + 1

      await createMessageMutation({
        variables: {
          text: textInput,
          chatroomId: roomId,
          createdByUserId: currentUserId,
          updatedAt: (new Date()).toISOString(),
          estimatedMessagesCount,
        }
      })
      this.setState({
        textInput: ''
      })

      this._emitStartTyping.cancel()
      this.emitStopTyping()

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
    if (!confirm(isSave ? "Save this talk? You can view all saved talks at Profile." : "Remove this talk from your saved list?")) return
    const { roomId, currentUserId } = this.props
    this.setState({
      mutatingSavedTalk: true
    })
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
    this.setState({
      mutatingSavedTalk: false,
    })
  }

  onTextInputChange = (e) => {
    // emit only increment of texts
    if (e.target.value.length > this.state.textInput.length) this._emitStartTyping()
    this.setState({ textInput: e.target.value })
    this._emitStopTyping()
  }           

  emitStartTyping = () => {
    const currentUserId = this.props.currentUserId
    if (!currentUserId) return;
    const authorId = this.props.chatroomQuery.Chatroom.createdBy.id
    if (authorId === currentUserId) {
      this.props.updateAuthorTypingMutation({
        variables: {
          chatroomId: this.props.roomId,
          isAuthorTyping: true,
        }
      })
    } else {
      this.props.updateMatchTypingMutation({
        variables: {
          chatroomId: this.props.roomId,
          isMatchTyping: true,
        }
      })
    }
  }

  emitStopTyping = () => {
    const currentUserId = this.props.currentUserId
    if (!currentUserId) return;
    const authorId = this.props.chatroomQuery.Chatroom.createdBy.id
    if (authorId === currentUserId) {
      this.props.updateAuthorTypingMutation({
        variables: {
          chatroomId: this.props.roomId,
          isAuthorTyping: false,
        }
      })
    } else {
      this.props.updateMatchTypingMutation({
        variables: {
          chatroomId: this.props.roomId,
          isMatchTyping: false,
        }
      })
    }
  }

  renderTyping = (chatroom) => {
    const currentUserId = this.props.currentUserId
    const canChat = this.props.canChat
    const authorId = chatroom.createdBy.id

    return (
      <div style={{ minHeight: '52px' }}>
      {this.state.isAuthorTyping
        &&
        <div className={!canChat ? 'msg-right-side' : authorId !== currentUserId ? 'msg-left-side' : ''}>
          <MessageListItem
            key="author-typing"
            showPlatoFace={!canChat || authorId !== currentUserId }
            isAuthorStyle
            text={'Typing...'}
            linkDetectionEnabled={false}
            mid="author-typing"
            customTextStyle={{
              color: Colors.main,
              fontSize: '12px',
              fontStyle: 'italic',
              padding: '10px 0',
            }}
          />
        </div>
      }
      {this.state.isMatchTyping 
        && 
        <div className={!canChat ? 'msg-left-side' : authorId === currentUserId ? 'msg-left-side' : '' }>
          <MessageListItem
            key="match-typing"
            showPlatoFace={true || !canChat || authorId === currentUserId }
            isAuthorStyle={false}
            text={'Typing...'}
            linkDetectionEnabled={false}
            mid="match-typing"
            customTextStyle={{
              color: 'black',
              fontSize: '12px',
              fontStyle: 'italic',
              padding: '10px 0',
            }}
          />
        </div>
      }
    </div>    
    )
  }
  renderChatroom = (chatroom, messages) => {
    const usersInChat = chatroom.users

    const { currentUserId } = this.props
    const canChat = this.props.canChat
    const isActiveChat = this.props.isActiveChat
    const isClosedChat = this.props.isClosedChat
    const chatroomTitle = this.props.linkedChatroomTitle
    const isSavedByCurrentUser = this.props.isSavedByCurrentUser
    const canSubmitMessage = this.state.textInput !== ''

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div className="header-wrapper">
          <div className="header">
            {currentUserId &&
              <div 
                className={`button ${isSavedByCurrentUser ? 'remove-button' : 'save-button'}`} 
                onClick={this.state.mutatingSavedTalk ? null : (() => this.onSaveOrRemoveChatroom(!isSavedByCurrentUser))}>
                  {isSavedByCurrentUser? 'remove' : 'save' }
              </div>
            }
            {canChat && isActiveChat && <div className="end-chat-button" onClick={this.onEndChatroom} >(End this chat)</div>}
          </div>
          <h2>{chatroomTitle}<span style={{ fontSize: '13px' }}> ({messages.length})</span></h2>
          {/* <p style={{ fontSize: '13px', fontStyle: 'italic' }}>{usersInChat.map(u => u.username).join(', ')}</p> */}
        </div>
        
        <div className="message-wrapper">
          {
            messages.length === 0 ?
              <ChatroomEmptyMessage 
                currentUserId={currentUserId}
                chatroom={chatroom} 
              />
              :
              <div>
                <MessageList 
                  messages={messages} 
                  currentUserId={currentUserId} 
                  userIds={usersInChat.map(u => u.id)} 
                  authorId={chatroom.createdBy.id}
                  isClosed={isClosedChat}
                />
                {this.renderTyping(chatroom)}
              </div>
          }
        </div>

        {canChat && isActiveChat &&
          <form onSubmit={canSubmitMessage ? this.onCreateMessage : null} className="input-wrapper" ref={(form) => { this.inputForm = form; }}>
            <textarea
              className="input"
              type="text"
              onChange={this.onTextInputChange}
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
            {canSubmitMessage && 
              <button 
                className="input-submit-button"
                type="submit"
                disabled={!canSubmitMessage}
              >
                Send
              </button>}
          </form>
        }        
        <style jsx>{`
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
            display: flex;
            align-items: flex-end;
          }
          .input {
            resize: none;
            border: 0;
            font-family: monospace;
            padding: 10px;
            font-size: 16px;
            width: 100%;
            height: 15vh;
            background-color: rgba(255,255,255,0.2);
          }
          .input:focus {
            outline: none;
          }
          .input-submit-button {
            line-height: 32px;
            display: flex;
            padding: 4px !important;
            background-color: white;
            color: blue;
            font-weight: bold;
            border: none;
            font-size: .9em;
            cursor: pointer;
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
      return <div>{`${chatroomError}`}</div> 
    }
    if (messagesError) {
      return <div>{`${messagesError}`}</div>
    }
    const messages = this.props.chatroomMessageQuery.allMessages
    const chatroom = this.props.chatroomQuery.Chatroom

    if (chatroomLoading 
      || (chatroomLoading && !chatroom) 
      || (messagesLoading && !messages)
      // *** OMG, TAKE ME HOURS HERE: must check if status 2 (variablesChanged), as ''messages' DOESN'T REFLECT variables in the query,
      // so there will be invalid state, and cause flashing when changing chatrooms ***
      // 
      // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-networkStatus
      || (messagesLoading && messages && this.props.chatroomMessageQuery.networkStatus === 2)) 
      {
        return <div style={{ margin: '8px'}}>Loading</div>
      }

    if (!chatroom) return <div style={{ margin: '8px'}}>This chatroom does not exist.</div>

    const isPrivateChat = (chatroom.stateType !== CHATROOM_STATE_TYPES.active && chatroom.stateType !== CHATROOM_STATE_TYPES.closed)
    const currentUserCanView = this.props.currentUserId && some(chatroom.users, { id: this.props.currentUserId })

    if (isPrivateChat && !currentUserCanView) return <div style={{ margin: '8px'}}>This chatroom is not available yet.</div>
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

export default compose(
  graphql(CHATROOM_QUERY, { name: 'chatroomQuery' }),
  graphql(CREATE_MESSAGE_MUTATION, { name: 'createMessageMutation' }),
  graphql(SAVE_CHATROOM_MUTATION, { name: 'saveChatroomMutation' }),
  graphql(UPDATE_AUTHOR_TYPING_MUTATION, { name: 'updateAuthorTypingMutation' }),
  graphql(UPDATE_MATCH_TYPING_MUTATION, { name: 'updateMatchTypingMutation' }),
  graphql(REMOVE_FROM_SAVED_CHATROOM_MUTATION, { name: 'removeFromSavedChatroomsMutation' }),
  graphql(CHATROOM_STATETYPE_MUTATION(CHATROOM_STATE_TYPES.closed), { name: 'endChatroomMutation' }),
  graphql(CHATROOM_MESSAGE_QUERY, { 
    name: 'chatroomMessageQuery',     
    options: (props) => {
      return {
        variables: {
          chatroomId: props.roomId
        },
        pollInterval: 20000,      
      }
    },
    props(receivedProps) {
      if (receivedProps.ownProps.chatroomQuery.Chatroom) {
        const chatroom = receivedProps.ownProps.chatroomQuery.Chatroom

        const chatroomTitle = chatroom.title

        const usersInChat = chatroom.users
        const currentUserId = receivedProps.ownProps.currentUserId
        const canChat = currentUserId ? (chatroom.stateType === CHATROOM_STATE_TYPES.active && (currentUserId === usersInChat[0].id || currentUserId === usersInChat[1].id)) : false
        const linkedChatroomTitle = insert_anchor(chatroomTitle)

        const isActiveChat = chatroom.stateType === CHATROOM_STATE_TYPES.active
        const isClosedChat = chatroom.stateType === CHATROOM_STATE_TYPES.closed
        const isSavedByCurrentUser = chatroom.savedByUsers.map(u => u.id).indexOf(currentUserId) > -1

        return {
          ...receivedProps,
          linkedChatroomTitle,
          canChat,
          isActiveChat,
          isClosedChat,
          isSavedByCurrentUser,
        }
      }
      return receivedProps
    }
}),
)(Chatroom)
