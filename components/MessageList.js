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
    const { messages, currentUserId, userIds, emptyComponentFunc, authorId } = this.props
    if (messages.length === 0) return emptyComponentFunc()    
    return (
      <div>
        {messages.map(m => {
          const isCurrentUser = m.createdByUserId === currentUserId
          const isAuthor = m.createdByUserId === authorId
          const platoFace = isAuthor ? 'plato-red.jpg' : 'plato.jpg'
          return (
            <div
              key={m.id} className="msg-list"
              style={{ marginLeft: isCurrentUser ? '40%' : '0', marginRight: isCurrentUser ? '0' : '40%' }}
            >
              {!isCurrentUser && <img src={`/static/${platoFace}`} alt="Platonos" className="plato" />}
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: isAuthor ? 'purple' : 'black', marginBottom: '3px' }}>{m.text}</p>
                <p style={{ fontSize: '10px', fontStyle: 'italic' }} >
                  {/* Maybe using this for reactivity? https://gist.github.com/aortbals/48fa1e3526e42698f24dc58c2f03bf74 */}
                  {moment(m.createdAt).fromNow()}
                </p> 
              </div> 
            </div>          
          )
        })}
        <style jsx scoped>{`
          .msg-list {
            display: flex;
            flex-direction: row;
          }
          .plato {
            flex: 0 0;
            width: 37px;
            height: 52px;
            margin-right: 10px;
          }
        `}</style>
      </div>
    );
  }
}

MessageList.propTypes = {
  userIds: React.PropTypes.array.isRequired,
  authorId: React.PropTypes.string.isRequired,
  messages: React.PropTypes.array.isRequired,
  currentUserId: React.PropTypes.string,
  emptyComponentFunc: React.PropTypes.func.isRequired,
}

export default MessageList
