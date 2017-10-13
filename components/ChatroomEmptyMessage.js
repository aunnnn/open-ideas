import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import { graphql, compose } from 'react-apollo'
import remove from 'lodash/remove'
import { CHATROOM_STATE_TYPES, PLATONOS_API_ENDPOINT } from '../constants'
import CHATROOM_STATETYPE_MUTATION_TO from '../graphql/ChatroomStateTypeMutation'
import { FIRSTLOAD_USER_CHATROOMS_QUERY } from '../graphql/UserChatrooms'

class ChatroomEmptyMessage extends Component {

  static propTypes = {
    chatroom: PropTypes.object.isRequired,
    currentUserId: PropTypes.string,
  }

  onAccept = async () => {
    if (!confirm("Accept this chat?")) { return }
    const roomId = this.props.chatroom.id
    try {
      await this.props.acceptChatroomMutation({
        variables: {
          id: roomId,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateChatroom: {
            __typename: 'Chatroom',
            id: roomId,
          },
        },
      })
    } catch (err) {
      alert("Oops: " + err.graphQLErrors[0].message);
    }
  }

  onDeny = async () => {
    // ************************************
    //        MUST REMOVE THIS CHAT FROM CURRENT USER'S STORE HERE!!!
    // ************************************
    if (!confirm("Do you really want to turn down this invitation?")) { return }
    const roomId = this.props.chatroom.id
    const authorId = this.props.chatroom.createdBy.id
    const currentUserId = this.props.currentUserId
    try {
      // It shouldn't be duplicated, but we prevent it for sure
      const deniedByUserIds = this.props.chatroom.deniedByUserIds.indexOf(currentUserId) > -1 ? 
        this.props.chatroom.deniedByUserIds.slice() 
        : 
        [...this.props.chatroom.deniedByUserIds, currentUserId]
      
      const config = JSON.stringify({
        excluded: deniedByUserIds,
      })
      const randomUser = await fetch(`${PLATONOS_API_ENDPOINT}/getRandomUser/${authorId}?config=${config}`)
      const anotherUser = await randomUser.json()
      const anotherUserId = anotherUser.user.gc_id

      if (!anotherUserId) {
        // If can't find, then just move to 'created' state
        alert("Oops! can't find another user")        
        await this.props.denyChatroomMutation({
          variables: {
            id: roomId,
            authorId,
            deniedByUserIds,
          },
          optimisticResponse: {
            __typename: 'Mutation',
            updateChatroom: {
              __typename: 'Chatroom',
              id: roomId,
            },
          },
          update: this.updateStoreAfterRemoval,
        })
        alert("Done chaging to 'created' state.")
        return
      }
      
      await this.props.denyAndInviteChatroomMutation({
        variables: {
          id: roomId,
          userIds: [authorId, anotherUserId],
          invitedUserId: anotherUserId,
          deniedByUserIds,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateChatroom: {
            __typename: 'Chatroom',
            id: roomId,
          },
        },
        update: this.updateStoreAfterRemoval,
      })
      alert("Done inviting another user!")
      Router.pushRoute(`/talk`)
    } catch (err) {
      if (err.graphQLErrors) alert("Oops: " + err.graphQLErrors[0].message);
      else {
        alert("Error: " + err)
      }
    }
  }

  updateStoreAfterRemoval = (store, { data: { updateChatroom }}) => {
    const currentUserId = this.props.currentUserId

    // UPDATE
    const allChatroomsData = store.readQuery({
      query: FIRSTLOAD_USER_CHATROOMS_QUERY,
      variables: {
        forUserId: currentUserId,
      }
    })

    remove(allChatroomsData.allChatrooms, {
      id: updateChatroom.id,
    })

    allChatroomsData._allChatroomsMeta.count -= 1

    store.writeQuery({
      data: allChatroomsData,
      query: FIRSTLOAD_USER_CHATROOMS_QUERY,
      variables: {
        forUserId: currentUserId,
      }
    })
  }

  onReport = () => {

  }

  render() {
    const chatroom = this.props.chatroom
    if (!chatroom) return <div>...Loading...</div>
    switch (chatroom.stateType) {
    case CHATROOM_STATE_TYPES.created:
      return <div>We're looking for a match....</div>
    
    case CHATROOM_STATE_TYPES.invited:
    if (chatroom.invitedUser.id === this.props.currentUserId) {
      return (
        <div>
          <h3 className="title">👤 Someone invites you to chat!</h3>
          <br />
          <p className="question">Do you want to talk?</p>
          {/* <br /> */}
          <div className="invitation-actions-container">
            <a onClick={this.onAccept} style={{ color: 'blue' }}>✔ Yes, start this chat.</a>
            <a onClick={this.onDeny} style={{ color: 'blue' }}>✖ No, I don't want to discuss this topic.</a>
            <a onClick={this.onReport} style={{ color: '#d87511', fontSize: '14px' }}>🙁 Report, this topic seems inappropriate, random or not suitable to the community.</a>
          </div>
          <style jsx>{`
            .title {
              background: #dce2ed;
              padding: 8px;
              text-align: center;
            }
            .question {
              font-size: 18px;
            }
            .invitation-actions-container a {
              margin-top: 12px;
              display: block;
              font-size: 16px;
              color: green;
              cursor: pointer;
            }

            .invitation-actions-container a:hover {                            
              font-weight: bold;
              font-size: 17px;
            }
          `}</style>

        </div>
      )
    } else {
      // Author will see this.            
      return (
        <div>
          <h3>Your match is already invited.</h3>
          <br/>
          <p><b>Your match can...</b></p>
          <p>• accept the topic, and the chat will start immediately,</p>
          <p>• reject the topic, in which case we will invite another user.</p>
          <hr/>
          <br/>
          {chatroom.deniedByUserIds.length > 0 
            && 
            <div>
              <h4 style={{ color: '#d87511' }}>🙁 Your topic has already been turned down by {chatroom.deniedByUserIds.length} people.</h4>
              <p>*A topic that has been rejected 3 times will be removed.*</p>
            </div>}
        </div>
      )
    }
    case CHATROOM_STATE_TYPES.active:
      return <div>This room is empty.</div>
    case CHATROOM_STATE_TYPES.closed:
      return <div>This room is closed and empty 😭</div>
    default: 
      return <div>This room is empty.</div>
    }
  }
}

export default compose(
  graphql(CHATROOM_STATETYPE_MUTATION_TO(CHATROOM_STATE_TYPES.active), { name: "acceptChatroomMutation" }),
  graphql(CHATROOM_STATETYPE_MUTATION_TO(CHATROOM_STATE_TYPES.invited), { name: "denyAndInviteChatroomMutation" }),
  graphql(CHATROOM_STATETYPE_MUTATION_TO(CHATROOM_STATE_TYPES.created), { name: "denyChatroomMutation" }),
)(ChatroomEmptyMessage)
