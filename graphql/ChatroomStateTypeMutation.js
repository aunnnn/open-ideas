import { gql } from 'react-apollo'
import { CHATROOM_STATE_TYPES } from '../constants'
const CHATROOM_STATETYPE_MUTATION_TO = (stateType) => {
  switch (stateType) {
    case CHATROOM_STATE_TYPES.active:
    case CHATROOM_STATE_TYPES.closed:
      // Change to active/closed: all are set, we just need to change stateType
      return gql`
        mutation ChatroomStateType($id: ID!) {
          updateChatroom(id: $id, stateType: ${stateType}) {
            id
          }
        }
      `
    case CHATROOM_STATE_TYPES.invited:
      // Change to invite: only case this will be called (on client) is when a user 'denies' an invitation, 
      // and the system 'successfully' invite another user.
      return gql`
        mutation ChatroomStateType($id: ID!, $userIds: [ID!]!, $invitedUserId: ID!, $deniedByUserIds: [String!]!) {
          updateChatroom(id: $id, stateType: ${CHATROOM_STATE_TYPES.invited}, usersIds: $userIds, invitedUserId: $invitedUserId, deniedByUserIds: $deniedByUserIds) {
            id
          }
        }
      `
    case CHATROOM_STATE_TYPES.created:
      // Change to invite: only case this will be called (on client) is when a user 'denies' an invitation, 
      // and the system can't immediately invite another user. (e.g., randomUser api returns null for some weird reasons)
      //
      // This chatroom will have to wait for cron job to invite.
      return gql`
        mutation ChatroomStateType($id: ID!, $authorId: ID!, $deniedByUserIds: [String!]!) {
          updateChatroom(id: $id, stateType: ${CHATROOM_STATE_TYPES.created}, usersIds: [$authorId], invitedUserId: null, deniedByUserIds: $deniedByUserIds) {
            id
          }
        }
      `
  }
}

export default CHATROOM_STATETYPE_MUTATION_TO
