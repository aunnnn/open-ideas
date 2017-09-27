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
    const { messages, currentUserId } = this.props
    if (messages.length === 0) return <div>This room is empty 😭</div>
    return (
      <div>
        {messages.map(m => (
          <div key={m.id}>
            <div style={{ marginLeft: m.createdByUserId === currentUserId ? '50%' : '0', marginBottom: '10px' }}>
              <p>{m.text}</p>
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
  messages: React.PropTypes.array.isRequired,
  currentUserId: React.PropTypes.string,
}

export default MessageList
