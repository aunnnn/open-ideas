import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withApollo, gql } from 'react-apollo'
import fetch from 'isomorphic-fetch'

import { FIRSTLOAD_CHATROOMS_QUERY } from '../graphql/PublicChatrooms'
import { FIRSTLOAD_USER_CHATROOMS_QUERY } from '../graphql/UserChatrooms'
import { CHATROOM_STATE_TYPES, PLATONOS_API_ENDPOINT } from '../constants'
import UserChatroomFragment from '../graphql/UserChatroomFragment'

class NewChat extends Component {
  
  constructor(props) {
    super(props);
    this.state = { 
      title: '',
    }
  }

  onCreateChat = async (e) => {
    e.preventDefault()

    const currentUserId = this.props.currentUserId

    if(!currentUserId) {
      alert('You must log in first.')
      return
    }

    try {
      const randomUser = await fetch(`${PLATONOS_API_ENDPOINT}/getRandomUser/${currentUserId}`)
      const anotherUser = await randomUser.json()
      if (!anotherUser.user) {
        alert("Something's wrong. We can't find another user right now.")
        return
      }
      const anotherUserId = anotherUser.user.gc_id   
      const dateString = (new Date()).toISOString()
      const { data: { createChatroom: { id } } } = await this.props.client.mutate({
        mutation: CREATE_CHAT_MUTATION,
        variables: {
          title: this.state.title,
          userIds: [currentUserId, anotherUserId],
          createdById: currentUserId,
          invitedUserId: anotherUserId,
          latestMessagesAt: dateString,
          stateType: CHATROOM_STATE_TYPES.invited,
      },
        // You may simply use this, in which case we don't need to update the store manually in 'update'
        // But this is slower.
        // refetchQueries: [
        //   {
        //     query: FIRSTLOAD_CHATROOMS_QUERY,
        //   },
        //   {
        //     query: FIRSTLOAD_USER_CHATROOMS_QUERY,
        //     variables: {
        //       forUserId: currentUserId,
        //     }
        //   }
        // ],
        optimisticResponse: {
          __typename: 'Mutation',
          createChatroom: {
            __typename: 'Chatroom',
            id: '',
            title: this.state.title,
            createdAt: dateString,
            _messagesMeta: {
              __typename: 'QueryMeta',
              count: 0,
            },
            users: [
              {
                __typename: 'User',
                id: currentUserId,
              }, 
              {
                __typename: 'User',
                id: anotherUserId,
              },
            ],
            invitedUser: {
              __typename: 'User',
              id: anotherUserId,
            },
            createdBy: {
              __typename: 'User',
              id: currentUserId,
            },
            deniedByUserIds: [],
            stateType: CHATROOM_STATE_TYPES.invited,
            latestMessagesAt: dateString,
          }
        },
        update: (store, { data: { createChatroom }}) => {
          // Update the store (so that the graphql components across the app will get updated)

          // Why doesn't it be smart and update all 'related' queries & components !??
          // https://github.com/apollographql/apollo-client/issues/1697
          function updateChatroomsQuery(query, variables) {
            try  {
              // All chatlist
              // 1. read from store
              const allChatroomsData = store.readQuery({
                query,
                variables,
              })
  
              // Must update messagesMeta manually, since the newly added object doesn't has one
              createChatroom._messagesMeta = {
                count: 0,
                __typename: '_QueryMeta',
              }
  
              // 2. append at first position
              allChatroomsData.allChatrooms.unshift(createChatroom)
              allChatroomsData._allChatroomsMeta.count += 1
  
              // 3. write back
              store.writeQuery({
                query,
                data: allChatroomsData,
                variables,
              })
            } catch (err) {
              // Probably query allChatrooms doesn't exist. (e.g., in case user enters directly to '/talk' page)
              // console.log('Err', err)
            }
          }

          updateChatroomsQuery(FIRSTLOAD_CHATROOMS_QUERY)
          updateChatroomsQuery(FIRSTLOAD_USER_CHATROOMS_QUERY, {
            forUserId: currentUserId,
          })
        },
      })
      
      // Update invited
      await fetch(`${PLATONOS_API_ENDPOINT}/updateUserLastInvitedAt/${anotherUserId}`)
      console.log('did update user last invited at')

      this.setState({
        title: '',
      })
      this.props.onCreateNewChatroom(id)
    } catch(err) {
      if (err.graphQLErrors) {
        alert("Oops: " + err.graphQLErrors[0].message);
      } else {
        alert("Error: " + err)
      }
    }
  }

  render() { 
    const confirmDisabled = !this.state.title
    return (
      <div>
        <form onSubmit={this.onCreateChat}>
          <input
              value={this.state.title}
              onChange={e => this.setState({ title: e.target.value})}
              placeholder="insert a topic here"
              type="text"
              className="add-chat-input"
          />
          
          <button
              className="primary-button"
              type="submit"
              disabled={confirmDisabled}
          >
              Create chat
          </button>
          <style jsx>{`
            .add-chat-input {
              height: 26px;
              margin-right: 8px;
            }
            .primary-button {
              border: none;
            }
          `}</style>
        </form>
      </div>)
    }
}

const CREATE_CHAT_MUTATION = gql`
  mutation CreateChatroomMutation($title: String!, $createdById: ID!, $userIds: [ID!]!, $invitedUserId: ID!, $latestMessagesAt: DateTime!, $stateType: Int!) {
    createChatroom(
      title: $title, 
      usersIds: $userIds, 
      createdById: $createdById, 
      stateType: $stateType,
      invitedUserId: $invitedUserId,
      latestMessagesAt: $latestMessagesAt,
    ) {
      ...UserChatroom
    }
  }

  ${UserChatroomFragment}
`

NewChat.propTypes = {
  currentUserId: PropTypes.string.isRequired,
  currentUsername: PropTypes.string.isRequired,
}

export default withApollo(NewChat)
