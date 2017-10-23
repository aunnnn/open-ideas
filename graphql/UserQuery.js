import { gql } from 'react-apollo'

export default gql`
query getCurrentUser($userId: ID!) {
  User(id: $userId) {
    createdAt
    savedChatrooms {
      id
      title
    }
  }
}
`
