import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import Colors from '../utils/Colors'

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

  componentDidUpdate(prevProps, prevState) {
    this.scrollToBottom()
  }
  
  componentDidMount() {
    this.scrollToBottom()
  }
  
  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView()
  }
  
  render() {        
    const { messages, currentUserId, authorId } = this.props
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
                <p style={{ color: isAuthor ? Colors.main : '#000', marginBottom: '3px' }}>{m.text}</p>
                <p style={{ fontSize: '10px', fontStyle: 'italic' }} >
                  {/* Maybe using this for reactivity? https://gist.github.com/aortbals/48fa1e3526e42698f24dc58c2f03bf74 */}
                  {moment(m.createdAt).fromNow()}
                </p> 
              </div> 
            </div>          
          )
        })}
        {this.props.isClosed && 
          <div>
            <br />
            <div className="end-of-chat">...End of chat...</div>
          </div>
        }
        <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
        </div>
        <style jsx scoped>{`
          .msg-list {
            display: flex;
            flex-direction: row;
            word-break: break-word;
          }
          .plato {
            flex: 0 0;
            width: 37px;
            height: 52px;
            margin-right: 10px;
          }
          .end-of-chat {
            font-style: italic;
            font-size: 14px;
            color: gray;
            text-align: center;
          }
        `}</style>
      </div>
    );
  }
}

MessageList.propTypes = {
  userIds: PropTypes.array.isRequired,
  authorId: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
  currentUserId: PropTypes.string,
  isClosed: PropTypes.bool.isRequired,
}

export default MessageList
