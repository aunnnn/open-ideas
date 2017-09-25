import React from 'react'
import PropTypes from 'prop-types'
import { graphql, gql } from 'react-apollo'

import withData from '../lib/withData'

const Chatroom = ({ data: { loading, error, Chatroom }, roomId  }) => {
  if (error) return <div>Error: {error}</div>
  if (Chatroom) {
    return (
      <div>        
        <h2>{Chatroom.title}</h2>
        <p>Id = {roomId}</p>
        <p>Users count = {Chatroom.users.length}</p>
        <p>Messages count = {Chatroom.messages.length}</p>
      </div>
    )
  }
  return <div>Loading</div>
}

Chatroom.propTypes = {
  roomId: PropTypes.string.isRequired,
};

const CHATROOM_QUERY = gql`
  query Chatroom($roomId: ID!) {
    Chatroom(id: $roomId) {
      title
      messages {
        text
        createdAt
        createdByUsername
      }
      users {
        id
        username
      }
    }
  }
`
export default graphql(CHATROOM_QUERY)(Chatroom)
