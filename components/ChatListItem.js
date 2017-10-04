import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment'

const ChatListItem = ({ title, count, createdAt }) => {
  return (
    <div>
      <p className="title">{title}({count})</p>
      <p style={{ fontStyle: 'italic', marginTop: '8px', fontSize: '12px' }}>{moment(createdAt).fromNow()}</p>    
      <style jsx scoped>{`
        .title {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

ChatListItem.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  createdAt: PropTypes.string.isRequired,
};

export default ChatListItem
