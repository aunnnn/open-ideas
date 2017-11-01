import { gql } from 'react-apollo'

export const CHATROOM_PARTICIPANT_TYPING_SUBSCRIPTION = (isAuthorTyping) => gql`
  subscription onTypingUsersChange($chatroomId: ID!) {
    Chatroom(filter: {
      mutation_in: [UPDATED],
      node: {
        id: $chatroomId,
      },
      updatedFields_contains: "${isAuthorTyping ? 'isAuthorTyping' : 'isMatchTyping'}",
    }) {
      node {
        ${isAuthorTyping ? 'isAuthorTyping' : 'isMatchTyping' }
      }
    }
  }
`

export const CHATROOM_PUBLIC_TYPING_SUBSCRIPTION = gql`
  subscription onTypingUsersChange($chatroomId: ID!) {
    Chatroom(filter: {
      mutation_in: [UPDATED],
      node: {
        id: $chatroomId,
      },
      updatedFields_contains_some: ["isAuthorTyping", "isMatchTyping"]
    }) {
      node {
        isAuthorTyping
        isMatchTyping
      }
    }
  }
`

export const CHATROOM_MESSAGE_SUBSCRIPTION= gql`
  subscription onNewMessages($chatroomId: ID!) {
    Message(
      filter: {
        mutation_in: [CREATED],
        node: {
          chatroom: {
            id: $chatroomId
          }
        }        
      }
    ) {
      node {
        id
        text
        createdAt
        createdByUserId
      }
    }
  }
`
// # Estimated messages count*
// # Graphcool doesn't support sort by aggregation (_allMessagesMeta) yet, 
// # so we need to store count in order to sort them (e.g. top 100)

// # this value will be updated at the same time as one of the user submit new message (to save # of requests to the server)
// # The 'estimatedCount' is directly retrieved from the current local cache of messages in that room +1 
// # (which won't reflect the actual count, e.g, but close enough).

// # A better (but additional request) would be to query the count first, +1, then update, but that's 2 requests per new message

export const CREATE_MESSAGE_MUTATION = gql`
  mutation createMessage($text: String!, $chatroomId: ID!, $createdByUserId: String!, $updatedAt: DateTime!, $estimatedMessagesCount: Int!) {
    createMessage (
      text: $text,
      chatroomId: $chatroomId,
      createdByUserId: $createdByUserId,
    ) {
      id
      text
      createdAt
      createdByUserId
    }

    updateChatroom(id: $chatroomId, latestMessagesAt: $updatedAt, estimatedMessagesCount: $estimatedMessagesCount,) {
      id
    }
  }
`

export const UPDATE_AUTHOR_TYPING_MUTATION = gql`
  mutation updateTyping($chatroomId: ID!, $isAuthorTyping: Boolean!) {
    updateChatroom(
      id: $chatroomId,
      isAuthorTyping: $isAuthorTyping,
    ) {
      id
    }
  }
`

export const UPDATE_MATCH_TYPING_MUTATION = gql`
  mutation updateTyping($chatroomId: ID!, $isMatchTyping: Boolean!) {
  updateChatroom(
    id: $chatroomId,
    isMatchTyping: $isMatchTyping,
  ) {
    id
  }
}
`


export const SAVE_CHATROOM_MUTATION = gql`
mutation saveChatroom($userId: ID!, $chatroomId: ID!) {
  addToUserSavedChatrooms(
    savedByUsersUserId: $userId,
    savedChatroomsChatroomId: $chatroomId,
  ) {
    savedByUsersUser {
      id
    }
  }
}
`

export const REMOVE_FROM_SAVED_CHATROOM_MUTATION = gql`
mutation removeChatroom($userId: ID!, $chatroomId: ID!) {
  removeFromUserSavedChatrooms(
    savedByUsersUserId: $userId, 
    savedChatroomsChatroomId: $chatroomId
  ) {
    savedByUsersUser {
      id
    }
  }
}
`
