import { gql } from 'react-apollo'

const UserChatroomFragment = gql`
  fragment Chatroom on Chatroom {
    id
    title
    createdAt
    _messagesMeta {
      count
    }
    users {
      id
    }
    invitedUser {
      id
    }
    createdBy {
      id
    }
    stateType
  }
`

export default UserChatroomFragment
