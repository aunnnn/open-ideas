import { gql } from 'react-apollo'

const UserChatroomFragment = gql`
  fragment UserChatroom on Chatroom {
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
    latestMessagesAt
    deniedByUserIds
    savedByUsers {
      id
    }
    isAuthorTyping
    isMatchTyping
  }
`

export default UserChatroomFragment
