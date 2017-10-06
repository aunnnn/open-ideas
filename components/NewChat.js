import React, { Component } from 'react'
import { withApollo, gql } from 'react-apollo'
import _ from 'lodash'

import { FIRSTLOAD_CHATROOMS_QUERY } from '../graphql/PublicChatrooms'
import { FIRSTLOAD_USER_CHATROOMS_QUERY } from '../graphql/UserChatrooms'
import { CHATROOM_STATE_TYPES } from '../constants'
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
    const currentUsername = this.props.currentUsername

    if(!currentUserId) {
      alert('You must log in first.')
      return
    }

    try {
      const userCount = (await this.props.client.query({ query: USER_COUNT_QUERY })).data._allUsersMeta.count
      const randomSkip = _.random(0, userCount - 2)
      if(userCount - 2 < 0) {
        alert("Oops, can't find any users.")
        return
      }

      // alert('random skip is' + randomSkip)

      // To prevent duplicate, get two random users, at least one will never be a duplicate.
      const twoRandomUsers  = (await this.props.client.query({
        query: GET_USERS_QUERY,
        variables: {
          first: 2,
          skip: randomSkip,
        }
      })).data.allUsers

      const twoRandomUserIds = twoRandomUsers.map(u => u.id)

      // alert('fetched users are' + twoRandomUsers.map(u => u.username).join(' '))

      let anotherUserId;
      let anotherUsername;

      // if both not same as current user id, can random
      if (twoRandomUserIds[0] !== currentUserId && twoRandomUserIds[1] !== currentUserId) {
        anotherUserId = _.sample(twoRandomUserIds)
        anotherUsername = anotherUserId === twoRandomUserIds[0] ? twoRandomUsers[0].username : twoRandomUsers[1].username
      } else {
        // some is duplicate, choose one that's not
        anotherUserId = twoRandomUserIds[0] !== currentUserId ? twoRandomUserIds[0] : twoRandomUserIds[1]
        anotherUsername = twoRandomUserIds[0] !== currentUserId ? twoRandomUsers[0].username : twoRandomUsers[1].username
      }

      // mock
      // anotherUserId = 'cj7xqakfn4i260157lq1wwoz3'
      // anotherUsername = 'test'

      const { data: { createChatroom: { id } } } = await this.props.client.mutate({
        mutation: CREATE_CHAT_MUTATION,
        variables: {
          title: this.state.title,
          userIds: [currentUserId, anotherUserId],
          createdById: currentUserId,
          invitedUserId: anotherUserId,
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
            createdAt: (new Date()).toISOString(),
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
            stateType: CHATROOM_STATE_TYPES.active,
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

      this.setState({
        title: '',
      })
      this.props.onCreateNewChatroom(id)
    } catch(err) {
      alert("Oops: " + err.graphQLErrors[0].message);
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
  mutation CreateChatroomMutation($title: String!, $createdById: ID!, $userIds: [ID!]!, $invitedUserId: ID!) {
    createChatroom(
      title: $title, 
      usersIds: $userIds, 
      createdById: $createdById, 
      stateType: ${CHATROOM_STATE_TYPES.active},
      invitedUserId: $invitedUserId,      
    ) {
      ...UserChatroom
    }
  }

  ${UserChatroomFragment}
`

const USER_COUNT_QUERY = gql`
  query UserCountQuery {
    _allUsersMeta {
      count
    }
  }
`

const GET_USERS_QUERY =  gql`
  query GetUsersQuery($first: Int!, $skip: Int!) {
    allUsers(first: $first, skip: $skip) {
      id,
      username,
    }
  }
`

NewChat.propTypes = {
  currentUserId: React.PropTypes.string.isRequired,
  currentUsername: React.PropTypes.string.isRequired,
}

export default withApollo(NewChat)
