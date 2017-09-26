import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo'
import moment from 'moment'

import Page from '../layouts/main'

class ChatList extends Component {

  render() {
    const { data: { loading, error, allChatrooms, _allChatroomsMeta }, onClickChatroom } = this.props;
    if (error) return <div>Error: {error}</div>
    if (allChatrooms) {
      if (allChatrooms.length === 0) return <div>No chats yet 😂</div>
      return (
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {allChatrooms.map((chat, index) => {
              return (
                <div key={chat.id}>
                  <li className='li-default' onClick={() => onClickChatroom(chat.id)}>
                    <p>{chat.title} ({chat.messages && chat.messages.length || 0})</p>
                    {/* <p>Users: {chat.users.map(u => u.username)}</p> */}
                    <p></p>
                    <p style={{ fontStyle: 'italic', marginTop: '8px', fontSize: '12px' }}>{moment(chat.createdAt).fromNow()}</p>
                    <style jsx>{`
                      .li-default {
                        cursor: pointer;
                        background-color: white;
                        padding: 8px;
                      }
      
                      .li-default:hover {
                        background-color: gray;
                      }
      
                      .li-active {
                        background-color: red;
                      }
                    `}</style>
                  </li>
                  <hr/>
              </div>
              )
            })}
          </ul>
        </div>
      )
    }
    return <div>Loading</div>  
  }
}
  

export const ALL_CHATROOMS_QUERY = gql`
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

ChatList.propTypes = {
  onClickChatroom: React.PropTypes.func.isRequired,
};

export default graphql(ALL_CHATROOMS_QUERY)(ChatList)
