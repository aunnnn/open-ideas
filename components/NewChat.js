import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'
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
      const { data: { createChatroom: { id } } } = await this.props.createChatMutation({
        variables: {
          title: this.state.title,
          userIds: [userId],
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

export default withData(graphql(CREATE_CHAT_MUTATION, {
  name: 'createChatMutation',
})(NewChat))
