import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router'
import moment from 'moment'
import Colors from '../utils/Colors';

const ChatListItem = ({ title, count, createdAt, active }) => {
  return (
    <div
      className={`chat-list-item ${active && 'active'}`}
    >
      <h2 className="title">{title}({count})</h2>
      <p style={{ fontStyle: 'italic', fontSize: '12px' }}>{moment(createdAt).fromNow()}</p>    
      <style jsx scoped>{`
        .chat-list-item {
          padding: 12px 15px 15px;
          border-bottom: 1px solid ${Colors.grey};
        }
        .chat-list-item.active {
          background-color: ${Colors.lightGrey};
        }
        .title {
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
};

export default withRouter(ChatListItem)
