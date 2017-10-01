import React, { Component } from 'react';
import moment from 'moment'

class MessageList extends Component {

  arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
      return false;
    for(var i = arr1.length; i--;) {
      if(arr1[i] !== arr2[i])
        return false;
    }
    return true;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const newMessages = nextProps.messages
    const messages = this.props.messages
    return !this.arraysEqual(newMessages, messages)
  }
  
  render() {        
    const { messages, currentUserId, userIds } = this.props
    if (messages.length === 0) return <div>This room is empty 😭</div>
    const authorId = userIds[0]
    return (
      <div>
        {messages.map(m => (
          <div key={m.id}>
            <div style={{ marginLeft: m.createdByUserId === currentUserId ? '40%' : '0', marginRight: m.createdByUserId === currentUserId ? '0' : '40%', marginBottom: '10px' }}>
              <p style={{ color: m.createdByUserId === authorId ? 'purple' : 'black' }}>{m.text}</p>
              <p style={{ fontSize: '10px' }} >
                {/* Maybe using this for reactivity? https://gist.github.com/aortbals/48fa1e3526e42698f24dc58c2f03bf74 */}
                {moment(m.createdAt).fromNow()}
              </p> 
            </div> 
          </div>          
        ))}
      </div>
    );
  }
}

MessageList.propTypes = {
  userIds: React.PropTypes.array.isRequired,
  messages: React.PropTypes.array.isRequired,
  currentUserId: React.PropTypes.string,
}

export default MessageList
