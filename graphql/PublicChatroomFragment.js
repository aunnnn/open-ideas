import { gql } from 'react-apollo'

const PublicChatroomFragment = gql`
  fragment PublicChatroom on Chatroom {
    id
    title
    createdAt
    updatedAt
    _messagesMeta {
      count
    }
    stateType
    estimatedMessagesCount
  }
`

export default PublicChatroomFragment
