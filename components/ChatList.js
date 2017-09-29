import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo'
import moment from 'moment'

import { N_CHATROOMS_FIRSTLOAD, N_CHATROOMS_LOADMORE } from '../constants'
import Page from '../layouts/main'
import ChatListItem from './ChatListItem'

// Change number of chats first load/ loadmore in constants.js
class ChatList extends Component {

  render() {
    const { loading, error, allChatrooms, _allChatroomsMeta, onClickChatroom, loadMoreEntries, noMore } = this.props;
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
                      title={chat.title}
                      count={chat._messagesMeta.count}
                      createdAt={chat.createdAt}
                    />
                  </li>
                  <style jsx>{`
                    .main {
                      cursor: pointer;
                      background-color: white;
                      padding: 8px;
                    }

                    .main:hover {
                      background-color: gray;
                    }
                  `}</style>  
                  <hr/>
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
    return <div>Loading</div>  
  }
}

export const ALL_CHATROOMS_QUERY = gql`
  query allChatrooms {
    allChatrooms(
      first: ${N_CHATROOMS_FIRSTLOAD},
      orderBy: createdAt_DESC,
    ) {
      id
      title
      createdAt
      _messagesMeta {
        count
      }
    }    

    _allChatroomsMeta {
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
    }
  }
`

ChatList.propTypes = {
  onClickChatroom: React.PropTypes.func.isRequired,
};

export default graphql(ALL_CHATROOMS_QUERY, {

  props({ data: { loading, error, allChatrooms, _allChatroomsMeta, fetchMore } }) {

    // Transform props
    // ---------------
    // The return props will be the available props. 
    // (this is called everytime data is changed, so allChatrooms might be undefined at first load)
    let cursor;
    let noMore = false;
    if (allChatrooms) {
      cursor = allChatrooms[allChatrooms.length-1].id
      noMore = allChatrooms.length === _allChatroomsMeta.count
    }
    return {
      loading,
      allChatrooms,
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
              _allChatroomsMeta: previousChatrooms._allChatroomsMeta, // use static count of chatrooms for now
            }
          }
        })
      }
    }
  }
})(ChatList)
