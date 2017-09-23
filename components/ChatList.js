import { graphql, gql } from 'react-apollo'
import moment from 'moment'

import Page from '../layouts/main'

function ChatList({ data: { loading, error, allChatrooms, _allChatroomsMeta } }) {
  if (error) return <div>Error: {error}</div>
  if (allChatrooms) {
    if (allChatrooms.length === 0) return <div>No chats yet 😂</div>
    return (
      <div>
        <ul>
          {allChatrooms.map((chat, index) => (
            <li key={chat.id}>
              <span>{index+1}.</span>
              <p>Title: {chat.title}</p>
              <p>{moment(chat.createdAt).fromNow()}</p>
              <p>Users: {chat.users.map(u => u.username)}</p>
              <p>Msgs: {chat.messages}</p>
              <hr/>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return <div>Loading</div>  
}

export const ALL_CHATS_QUERY = gql`
  query allChatrooms {
    allChatrooms(orderBy: createdAt_DESC) {
      id
      title
      createdAt
      users {
        username
      }
    },
    _allChatroomsMeta {
      count
    }
  }
`

export default graphql(ALL_CHATS_QUERY)(ChatList)
