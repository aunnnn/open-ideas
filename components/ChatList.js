import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo'
import orderBy from 'lodash/orderBy'
import some from 'lodash/some'

import ChatListItem from './ChatListItem'
import Colors from '../utils/Colors';
import { FIRSTLOAD_CHATROOMS_QUERY, MORE_CHATROOMS_QUERY } from '../graphql/PublicChatrooms'
import { CHATROOM_STATE_TYPES } from '../constants'
import { computeSlugFromChatTitleAndID } from '../utils/misc'

// Change number of chats first load/ loadmore in constants.js
class ChatList extends Component {

  static propTypes = {
    onClickChatroom: PropTypes.func.isRequired,
    initialChatroom: PropTypes.object,
    currentRoomId: PropTypes.string,
    sortedBy: PropTypes.string.isRequired,
    dateDisplayFunction: PropTypes.func.isRequired,
  };

  render() {
    const { 
      loading, 
      error, 
      allChatrooms, 
      _allChatroomsMeta, 
      onClickChatroom, 
      loadMoreEntries, 
      noMore, 
      currentRoomId, 
      dateDisplayFunction 
    } = this.props;

    if (loading) return <div style={{ margin: '8px'}}>Loading</div>
    if (error) return <div style={{ margin: '8px'}}>Error: {error}</div>
    if (allChatrooms) {
      if (allChatrooms.length === 0) return <div>No chats yet 😂</div>
      return (
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {allChatrooms.map((chat) => {
              const computedSlug = computeSlugFromChatTitleAndID(chat.title, chat.id)
              return (
                <div key={chat.id}>
                  <li className="main" onClick={() => onClickChatroom(computedSlug)}>
                    <ChatListItem 
                      id={chat.id}
                      title={chat.title}
                      count={chat._messagesMeta.count}
                      displayDate={dateDisplayFunction(chat)}
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
            <div style={{ color: 'gray', textAlign: 'center', fontSize: '14px', marginTop: '20px' }}>{_allChatroomsMeta.count} talk{_allChatroomsMeta.count !== 1 && 's'}</div>}
        </div>
      )
    }
    return <div>Something wrong, this shouldn't show.</div>
  }
}

export default graphql(FIRSTLOAD_CHATROOMS_QUERY, {
  options: props => {
    return {
      variables: {
        orderBy: props.sortedBy,
      }
    }
  },
  props(receivedProps) {
    const { ownProps: { initialChatroom, sortedBy } } = receivedProps
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

    // Show to public only active/closed
    if (sortedBy === 'new' && initialChatroom && (initialChatroom.stateType === CHATROOM_STATE_TYPES.active || initialChatroom.stateType === CHATROOM_STATE_TYPES.closed)) {
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
            orderBy: sortedBy,
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
