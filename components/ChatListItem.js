import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router'
import moment from 'moment'
import Colors from '../utils/Colors';
import { CHATROOM_STATE_TYPES } from '../constants'

const renderItemByStateType = (props) => {
  // Earth fix this for me, chat-item-title cannot be used here.... just restyle it
  const { title, count, createdAt, active, stateType } = props
  
  switch (stateType) {
  case CHATROOM_STATE_TYPES.created:
    // created chat/ no match yet
    return (
      <div>
        <p className="chat-item-title">{title}<span style={{ fontSize: '12px', color: 'orange', opacity: '1.0' }}>...finding user</span></p>
        <p style={{ fontStyle: 'italic', fontSize: '12px' }}>{moment(createdAt).fromNow()}</p>
      </div>
    )
  case CHATROOM_STATE_TYPES.invited:
    // another user is invited to join this chat
    return (
      <div>
        <p className="chat-item-title">{title}<span style={{ fontSize: '12px', color: 'blue' }}> invited </span></p>
        <p style={{ fontStyle: 'italic', fontSize: '12px' }}>{moment(createdAt).fromNow()}</p>
      </div>
    )
  case CHATROOM_STATE_TYPES.active:
    // active chat
    return (
      <div>
        <p className="chat-item-title">{title} ({count})</p>
        <p style={{ fontStyle: 'italic', fontSize: '12px' }}>{moment(createdAt).fromNow()}</p>
      </div>
    )
  case CHATROOM_STATE_TYPES.closed:
    // closed chat
    return (
      <div style={{ opacity: 0.5 }}>
        <p className="chat-item-title">{title}<span style={{ fontSize: '12px', color: 'orange' }}> closed </span></p>
        <p style={{ fontStyle: 'italic', fontSize: '12px' }}>{moment(createdAt).fromNow()}</p>
      </div>
    )

  default:
    return (
      <div>
        <p className="chat-item-title">{title}</p>
        <p style={{ fontStyle: 'italic', fontSize: '12px' }}>{moment(createdAt).fromNow()}</p>
      </div>
    )
  }
}

const ChatListItem = (props) => {
  const active = props.active
  return (
    <div
      className={`chat-list-item ${active && 'active'}`}
    >
      {renderItemByStateType(props)} 
      <style jsx scoped>{`
        .chat-list-item {
          padding: 12px 15px 15px;
          border-bottom: 1px solid ${Colors.grey};
        }
        .chat-list-item.active {
          background: ${Colors.lightGrey};
        }
        .chat-item-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

ChatListItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  createdAt: PropTypes.string.isRequired,
  stateType: PropTypes.number,
};

export default withRouter(ChatListItem)
