import { gql } from 'react-apollo'

export default gql`
query getCurrentUser($userId: ID!) {
  User(id: $userId) {
    createdAt
    savedChatrooms {
      id
      title
      _messagesMeta {
        count
      }
    }
  }
}
`

export const CHECK_USER_TOTAL_CREATED_CHATS = gql`
  query CheckTotalChats($userId: ID!, $date_gte: DateTime!, $date_lte: DateTime!) {
    _allChatroomsMeta(filter: {
        AND: [{
            createdBy: { id: $userId }
        }, {
            createdAt_gte: $date_gte,
        }, {
            createdAt_lte: $date_lte,
        }]
    }) {
      count
    }
  }
`

export const GET_USER_AND_CHECK_USER_TOTAL_CREATED_CHATS = gql`
  query getCurrentUserAndTotalChats($userId: ID!, $date_gte: DateTime!, $date_lte: DateTime!) {
    User(id: $userId) {
      createdAt
      savedChatrooms {
        id
        title
        _messagesMeta {
          count
        }
      }
    }

    _allChatroomsMeta(filter: {
        AND: [{
            createdBy: { id: $userId }
        }, {
            createdAt_gte: $date_gte,
        }, {
            createdAt_lte: $date_lte,
        }]
    }) {
      count
    }
  }
`
