import { gql } from 'react-apollo'
import { N_CHATROOMS_FIRSTLOAD, N_CHATROOMS_LOADMORE, CHATROOM_STATE_TYPES } from '../constants'
import PublicChatroomFragment from './PublicChatroomFragment'

export const FIRSTLOAD_CHATROOMS_QUERY = gql`
  query allChatrooms($orderBy: ChatroomOrderBy!) {
    allChatrooms(
      first: ${N_CHATROOMS_FIRSTLOAD},
      orderBy: $orderBy,
      filter: {
        stateType_in: [${CHATROOM_STATE_TYPES.closed}, ${CHATROOM_STATE_TYPES.active}],
      },
    ) {
      ...PublicChatroom
    }    

    _allChatroomsMeta(filter: {
      stateType_in: [${CHATROOM_STATE_TYPES.closed}, ${CHATROOM_STATE_TYPES.active}],
    }) {
      count
    }
  }

  ${PublicChatroomFragment}
`

export const MORE_CHATROOMS_QUERY = gql`
  query moreChatrooms($after: String!, $orderBy: ChatroomOrderBy!) {
    allChatrooms(
      first: ${N_CHATROOMS_LOADMORE}, 
      after: $after,
      orderBy: $orderBy,
      filter: {
        stateType_in: [${CHATROOM_STATE_TYPES.closed}, ${CHATROOM_STATE_TYPES.active}],
      },
    ) {
        ...PublicChatroom
    }
  }

  ${PublicChatroomFragment}
`
