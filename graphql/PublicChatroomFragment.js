import { gql } from 'react-apollo'

const PublicChatroomFragment = gql`
  fragment PublicChatroom on Chatroom {
    id
    title
    createdAt
    _messagesMeta {
      count
    }
    stateType
  }
`

export default PublicChatroomFragment
