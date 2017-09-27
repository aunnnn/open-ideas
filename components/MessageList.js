import React, { Component } from 'react';
import moment from 'moment'

class MessageList extends Component {

  render() {        
    const { messages, currentUserId } = this.props
    console.log('render message list', messages.length)
    if (messages.length === 0) return <div>This room is empty 😭</div>
    return (
      <div>
        {messages.map(m => (
          <div key={m.id}>
            <div style={{ marginLeft: m.createdByUserId === currentUserId ? '50%' : '0' }}>
              <p>{m.text}</p>
              <p style={{ fontSize: '10px' }}>{moment(m.createdAt).fromNow()}</p>
            </div> 
          </div>          
        ))}
      </div>
    );
  }
}

MessageList.propTypes = {
  messages: React.PropTypes.array.isRequired,
  currentUserId: React.PropTypes.string,
}

export default MessageList
