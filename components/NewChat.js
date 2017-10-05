import React, { Component } from 'react'
import { withApollo, gql } from 'react-apollo'
import _ from 'lodash'

import { FIRSTLOAD_CHATROOMS_QUERY } from './ChatList'

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


      const { data: { createChatroom: { id } } } = await this.props.client.mutate({
        mutation: CREATE_CHAT_MUTATION,
        variables: {
          title: this.state.title,
          userIds: [currentUserId, anotherUserId],
        },
        optimisticResponse: {
          __typename: 'Mutation',
          createChatroom: {
            __typename: 'Chatroom',
            id: '',
            createdAt: (new Date()).toISOString(),
            title: this.state.title,
            users: [
              {
                __typename: 'User',
                id: '',
                username: currentUsername,
              }, 
              {
                __typename: 'User',
                id: '',
                username: anotherUsername,
              }
            ],
          }
        },
        update: (store, { data: { createChatroom }}) => {

          // Update the store (so that the graphql components across the app will get updated)

          // 1. read from store
          const data = store.readQuery({
            query: FIRSTLOAD_CHATROOMS_QUERY,
          })

          // Must update messagesMeta manually, since the newly added object doesn't has one
          createChatroom._messagesMeta = {
            count: 0,
            __typename: '_QueryMeta',
          }

          // 2. append at first position
          data.allChatrooms.splice(0,0,createChatroom)
          data._allChatroomsMeta.count += 1

          // 3. write back
          store.writeQuery({
            query: FIRSTLOAD_CHATROOMS_QUERY,
            data
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
  mutation CreateChatroomMutation($title: String!, $userIds: [ID!]!) {
    createChatroom(title: $title, usersIds: $userIds) {
      id,
      createdAt,
      title,
      users {
        id,
        username,
      }
    }
  }
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
