import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router'
import moment from 'moment'
import Colors from '../utils/Colors';
import { CHATROOM_STATE_TYPES } from '../constants'

const displayedTextForState = (state, isInvitationForCurrentUser) => {
  switch (state) {
    case CHATROOM_STATE_TYPES.created: return 'finding...'
    case CHATROOM_STATE_TYPES.invited: return isInvitationForCurrentUser ? 'new request' : 'invited'
    case CHATROOM_STATE_TYPES.active: return 'active'
    case CHATROOM_STATE_TYPES.closed: return 'closed'
    default: return 'error'
  }
}

const colorThemeForState = (state, isInvitationForCurrentUser) => {
  switch (state) {
    case CHATROOM_STATE_TYPES.created: return 'gray'
    case CHATROOM_STATE_TYPES.invited: return isInvitationForCurrentUser ? 'blue' : 'gray'
    case CHATROOM_STATE_TYPES.active: return '#48e255'
    case CHATROOM_STATE_TYPES.closed: return 'gray'
    default: return 'black'
  }
}

const renderItemByStateType = (props) => {
  // Earth fix this for me, chat-item-title cannot be used here.... just restyle it
  const { title, count, displayDate, stateType, isInvitationForCurrentUser } = props
  const themeColor = colorThemeForState(stateType, isInvitationForCurrentUser)
  const newInvitationForCurrentUser = stateType === CHATROOM_STATE_TYPES.invited && isInvitationForCurrentUser
  return (
    <div className="main">
      <p className="chat-item">{title} <span>({count})</span></p>
      <p className="date">{moment(displayDate).fromNow()}
        {
          stateType 
          &&
          <span className="state-display"> • {displayedTextForState(stateType, isInvitationForCurrentUser)}</span>
        }
      </p>
      <style jsx>{`
        .main {
          opacity: ${stateType === CHATROOM_STATE_TYPES.closed ? 0.5 : 1.0};
        }
        .date {
          font-style: italic;
          font-size: 11px;
          color: gray;
        }
        .chat-item {
          font-size: 16px;
          margin-bottom: 8px;
          word-spacing: -2px;
        }
        .chat-item > span {
          font-size: 12px;
        }
        .state-display {
          color: ${themeColor};
          font-weight: ${newInvitationForCurrentUser ? 'bold' : 'normal'};
          font-size: ${newInvitationForCurrentUser ? '14px' : '11px'}
        }
      `}</style>
    </div>
  )
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
          padding: 12px 8px 12px 12px;
          border-bottom: 1px solid ${Colors.grey};
        }
        .chat-list-item.active {
          background: ${Colors.lightGrey};
        }
      `}</style>
      <style jsx global>{`
        .chat-item-active {
          font-size: 18px;
          margin-bottom: 5px;
          word-spacing: -2px;
        }
      `}</style>
    </div>
  );
};

ChatListItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  displayDate: PropTypes.string.isRequired,
  stateType: PropTypes.number,
  isInvitationForCurrentUser: PropTypes.bool,
  active: PropTypes.bool.isRequired,
};

export default withRouter(ChatListItem)
