import { gql } from 'react-apollo'
import UserChatroomFragment from './UserChatroomFragment'
import { N_CHATROOMS_FIRSTLOAD, N_CHATROOMS_LOADMORE } from '../constants'

export const USER_CHATROOMS_SUBSCRIPTION = gql`
subscription onChatroomUpdate($forUserId: ID!) {
  Chatroom(
    filter: {
      mutation_in: [CREATED, UPDATED],
      node: {
        users_some: {
          id: $forUserId,
        },
      },
    }
  ) {
    node {
      ...UserChatroom
    }
    mutation
    updatedFields
  }
}

${UserChatroomFragment}
`

export const FIRSTLOAD_USER_CHATROOMS_QUERY = gql`
query allChatrooms($forUserId: ID!) {
  allChatrooms(
    first: ${N_CHATROOMS_FIRSTLOAD},
    orderBy: createdAt_DESC,
    filter: {
      users_some: {
        id: $forUserId,
      },
    },
  ) {
    ...UserChatroom
  }    

  _allChatroomsMeta(
    filter: {
      users_some: {
        id: $forUserId,
      },
    },
  ) {
    count
  }
}

${UserChatroomFragment}
`

export const MORE_USER_CHATROOMS_QUERY = gql`
query moreChatrooms($after: String!, $forUserId: ID!) {
  allChatrooms(
    first: ${N_CHATROOMS_LOADMORE}, 
    after: $after,
    orderBy: createdAt_DESC,
    filter: {
      users_some: {
        id: $forUserId,
      },
    },
  ) {
      ...UserChatroom
  }
}
${UserChatroomFragment}
`
