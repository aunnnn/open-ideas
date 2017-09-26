import React, { Component } from 'react'
import { withApollo, gql } from 'react-apollo'
import _ from 'lodash'

import withData from '../lib/withData'
import { GC_USER_ID, GC_USERNAME } from '../constants'
import { ALL_CHATROOMS_QUERY } from './ChatList'

class NewChat extends Component {
  
  constructor(props) {
    super(props);
    this.state = { 
      title: '',
    }
  }

  onCreateChat = async (e) => {
    e.preventDefault()
    const userId = localStorage.getItem(GC_USER_ID)
    if(!userId) {
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

      const twoRandomUserIds  = (await this.props.client.query({
        query: GET_USERS_QUERY,
        variables: {
          first: 2,
          skip: randomSkip,
        }
      })).data.allUsers.map(u => u.id)


      const currentUser = await this.props.client.query({
        query: CURRENT_USER_QUERY
      })

      if (!currentUser) {
        alert('You are not logged in.')
        return
      }

      const anotherUserId = twoRandomUserIds[0] !== currentUser ? twoRandomUserIds[0] : twoRandomUserIds[1]
      const { data: { createChatroom: { id } } } = await this.props.client.mutate({
        mutation: CREATE_CHAT_MUTATION,
        variables: {
          title: this.state.title,
          userIds: [userId, anotherUserId],
        },
        optimisticResponse: {
          __typename: 'Mutation',
          createChatroom: {
            __typename: 'Chatroom',
            id: '',
            createdAt: +new Date,
            title: this.state.title,
            users: [
              {
                __typename: 'User',
                id: '',
                username: localStorage.getItem(GC_USERNAME),
              }
            ],
          }
        },
        update: (store, { data: { createChatroom }}) => {

          // Update the store (so that the graphql components across the app will get updated)

          // 1. read from store
          const data = store.readQuery({
            query: ALL_CHATROOMS_QUERY,
          })

          // 2. append at first position
          data.allChatrooms.splice(0,0,createChatroom)

          // 3. write back
          store.writeQuery({
            query: ALL_CHATROOMS_QUERY,
            data
          })
        },
      })

      console.log('#user', userCount)
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
          >
          </input>
          
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
    }
  }
`

const CURRENT_USER_QUERY = gql`
  query {
    user {
      id,
      username
    }
  }
`
export default withData(withApollo(NewChat))
