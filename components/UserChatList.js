import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo'
import moment from 'moment'

import orderBy from 'lodash/orderBy'

import { N_CHATROOMS_FIRSTLOAD, N_CHATROOMS_LOADMORE } from '../constants'
import Page from '../layouts/main'
import ChatListItem from './ChatListItem'

import Colors from '../utils/Colors';

// Change number of chats first load/ loadmore in constants.js
class UserChatList extends Component {

  static propTypes = {
    onClickChatroom: React.PropTypes.func.isRequired,
    forUserId: React.PropTypes.string,
    currentRoomId: React.PropTypes.string,
  }

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
                      stateType={chat.stateType}
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
    return <div>Login to view your chats.</div>
  }
}

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
      id
      title
      createdAt
      _messagesMeta {
        count
      }
      users {
        id
      }
      stateType
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
`

const MORE_USER_CHATROOMS_QUERY = gql`
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
        id
        title
        createdAt
        _messagesMeta {
          count
        }
        users {
          id
        }
        stateType
    }
  }
`
export default graphql(FIRSTLOAD_USER_CHATROOMS_QUERY, {

  skip: ({ forUserId }) => {
    return forUserId ? false : true
  },

  props({ data: { loading, error, allChatrooms, _allChatroomsMeta, fetchMore }, ownProps: { forUserId } }) {

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
    const orderedChatrooms = orderBy(allChatrooms, ['stateType', 'createdAt'])
    return {
      loading,
      allChatrooms: orderedChatrooms,
      _allChatroomsMeta,
      error,
      noMore: noMore,
      loadMoreEntries: () => {
        return fetchMore({
          query: MORE_USER_CHATROOMS_QUERY,
          variables: {
            after: cursor,
            forUserId: forUserId,
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
})(UserChatList)
