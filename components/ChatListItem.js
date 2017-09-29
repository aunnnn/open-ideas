import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment'

const ChatListItem = ({ title, count, createdAt }) => {
  return (
    <div>
      <p>{title}({count})</p>
      <p style={{ fontStyle: 'italic', marginTop: '8px', fontSize: '12px' }}>{moment(createdAt).fromNow()}</p>    
    </div>
  );
};

ChatListItem.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  createdAt: PropTypes.string.isRequired,
};

export default ChatListItem
