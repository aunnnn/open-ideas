import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo'
import moment from 'moment'

import orderBy from 'lodash/orderBy'

import { USER_CHATROOMS_SUBSCRIPTION, FIRSTLOAD_USER_CHATROOMS_QUERY, MORE_USER_CHATROOMS_QUERY } from '../graphql/UserChatrooms'
import Page from '../layouts/main'
import ChatListItem from './ChatListItem'

import Colors from '../utils/Colors';

const orderedUserChatrooms = (chatrooms) => {
  return orderBy(chatrooms, ['stateType', 'createdAt'], ['asc', 'desc'])
}
// Change number of chats first load/ loadmore in constants.js
class UserChatList extends Component {

  static propTypes = {
    onClickChatroom: React.PropTypes.func.isRequired,
    forUserId: React.PropTypes.string,
    currentRoomId: React.PropTypes.string,
  }

  componentWillReceiveProps(nextProps) {
    if (!process.browser) return

    if(this.props.allChatrooms) {

      // Check for existing subscription      
      if (this.unsubscribe) {
        // Check if props have changed and, if necessary, stop the subscription
        this.unsubscribe()
      }
      // Subscribe
      console.log('...subscribe user chatroom updates')
      this.unsubscribe = this.subscribeToChatroomUpdates()
    } 
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      console.log('-> unsubscribe user chatroom updates')
      this.unsubscribe()
    }
  }
  
  subscribeToChatroomUpdates = () => {
    return this.props.subscribeToMore({
      document: USER_CHATROOMS_SUBSCRIPTION,
      variables: {
        forUserId: this.props.forUserId,
      },
      updateQuery: (previous, { subscriptionData }) => {
        const Chatroom = subscriptionData.data.Chatroom.node
        const updatedFields = subscriptionData.data.Chatroom.updatedFields
        const mutation = subscriptionData.data.Chatroom.mutation
        console.log('mutation: ', mutation)
        console.log('updated Fields: ', updatedFields)

        if (mutation === "UPDATED") {
          if (updatedFields[0] !== "stateType") {
            console.error(`Received UPDATED sub of chatrooms but updated field is not stateType (${updatedFields[0]}).`)
            return previous
          } else {
            console.log('update by just ordering...?')
            return previous
          }
        } else if (mutation === "CREATED") {
          return {
            ...previous,
            allChatrooms: orderedUserChatrooms([...previous.allChatrooms, Chatroom]),
          }
        }
      }
    })
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

export default graphql(FIRSTLOAD_USER_CHATROOMS_QUERY, {

  skip: ({ forUserId }) => {
    return forUserId ? false : true
  },

  props(receivedProps) {

    const { data: { loading, error, allChatrooms, _allChatroomsMeta, fetchMore, subscribeToMore }, ownProps: { forUserId } } = receivedProps
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
    const orderedChatrooms = orderedUserChatrooms(allChatrooms)
    return {
      loading,
      allChatrooms: orderedChatrooms,
      _allChatroomsMeta,
      error,
      noMore: noMore,
      subscribeToMore,
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
