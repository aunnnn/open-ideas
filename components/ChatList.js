import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo'
import moment from 'moment'
import orderBy from 'lodash/orderBy'
import some from 'lodash/some'

import { N_CHATROOMS_FIRSTLOAD, N_CHATROOMS_LOADMORE } from '../constants'
import Page from '../layouts/main'
import ChatListItem from './ChatListItem'

import Colors from '../utils/Colors';

// Change number of chats first load/ loadmore in constants.js
class ChatList extends Component {

  static propTypes = {
    onClickChatroom: React.PropTypes.func.isRequired,
    initialChatroom: React.PropTypes.object,
    currentRoomId: React.PropTypes.string,
  };

  render() {
    const { loading, error, allChatrooms, _allChatroomsMeta, onClickChatroom, loadMoreEntries, noMore, currentRoomId } = this.props;
    if (loading) return <div>Loading</div>
    if (error) return <div>Error: {error}</div>
    if (allChatrooms) {
      if (allChatrooms.length === 0) return <div>No chats yet 😂</div>
      return (
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {allChatrooms.map((chat, index) => {
              return (
                <div key={chat.id}>
                  <li className="main" onClick={() => onClickChatroom(chat.id)}>
                    <ChatListItem 
                      id={chat.id}
                      title={chat.title}
                      count={chat._messagesMeta.count}
                      createdAt={chat.createdAt}
                      active={chat.id === currentRoomId}
                    />
                  </li>
                  <style jsx>{`
                    .main {
                      cursor: pointer;
                      background-color: white;
                    }

                    .main:hover {
                      background-color: ${Colors.lightGrey};
                    }
                  `}</style>  
              </div>
              )
            })}
          </ul>
          {!noMore ? 
            <div onClick={loadMoreEntries} style={{ color: 'blue', textAlign: 'center', cursor: 'pointer' }}>load more</div>
            :
            <div style={{ color: 'gray', textAlign: 'center', fontSize: '14px', marginTop: '20px' }}>{_allChatroomsMeta.count} chats</div>}
        </div>
      )
    }
    return <div>Something wrong, this shouldn't show.</div>
  }
}

export const FIRSTLOAD_CHATROOMS_QUERY = gql`
  query allChatrooms {
    allChatrooms(
      first: ${N_CHATROOMS_FIRSTLOAD},
      orderBy: createdAt_DESC,
      filter: {
        stateType_in: [2, 3],
      },
    ) {
      id
      title
      createdAt
      _messagesMeta {
        count
      }
      stateType
    }    

    _allChatroomsMeta(filter: {
      stateType_in: [2, 3],
    }) {
      count
    }
  }
`

const MORE_CHATROOMS_QUERY = gql`
  query moreChatrooms($after: String!) {
    allChatrooms(
      first: ${N_CHATROOMS_LOADMORE}, 
      after: $after,
      orderBy: createdAt_DESC,
    ) {
        id
        title
        createdAt
        _messagesMeta {
          count
        }
        stateType
    }
  }
`
export default graphql(FIRSTLOAD_CHATROOMS_QUERY, {

  props(receivedProps) {
    const { ownProps: { initialChatroom } } = receivedProps
    const { data: { loading, error, _allChatroomsMeta, fetchMore } } = receivedProps
    let allChatrooms = receivedProps.data.allChatrooms

    // Transform props
    // ---------------
    // The return props will be the available props. 
    // (this is called everytime data is changed, so allChatrooms might be undefined at first load)
    let cursor;
    let noMore = false;
    if (allChatrooms) {      
      cursor = allChatrooms.length > 0 ? allChatrooms[allChatrooms.length-1].id : null
      noMore = allChatrooms.length === _allChatroomsMeta.count
    }
    let allChatroomsWithInitial = allChatrooms
    if (initialChatroom) {
      // **Append initialChat only when it doesn't already exist in allChatrooms.
      if (!some(allChatrooms, { id: initialChatroom.id })) {
        allChatroomsWithInitial = orderBy([...allChatrooms, initialChatroom], 'createdAt', 'desc')
      }
    }
    return {
      loading,
      allChatrooms: allChatroomsWithInitial,
      _allChatroomsMeta,
      error,
      noMore: noMore,
      loadMoreEntries: () => {
        return fetchMore({
          query: MORE_CHATROOMS_QUERY,
          variables: {
            after: cursor,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const previousChatrooms = previousResult.allChatrooms
            const newChatrooms = fetchMoreResult.allChatrooms

            const count = newChatrooms.length
            const newCursor = noMore ? fetchMoreResult.allChatrooms[count - 1].id : cursor
            return {
              cursor: newCursor,
              allChatrooms: [...previousChatrooms, ...newChatrooms],
              _allChatroomsMeta: previousResult._allChatroomsMeta, // use static count of chatrooms for now
            }
          }
        })
      }
    }
  }
})(ChatList)
