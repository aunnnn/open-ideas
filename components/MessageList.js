import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import Colors from '../utils/Colors'
import urlRegex from 'url-regex'
import { insert_anchor } from '../utils/transform';

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

  renderMessagesForParticipant = () => {
    const { messages, currentUserId, authorId } = this.props
    return (
      <div>
        {messages.map(m => {
          const isCurrentUserMessage = m.createdByUserId === currentUserId
          const isAuthor = m.createdByUserId === authorId
          const anotherUserFace = !isCurrentUserMessage && currentUserId !== authorId ? 'plato-red.jpg' : 'plato.jpg'

          const text = insert_anchor(m.text)

          return (
            <div
              key={m.id} className="msg-list"
              style={{ marginLeft: isCurrentUserMessage ? '40%' : '0', marginRight: isCurrentUserMessage ? '0' : '40%' }}
            >
              {!isCurrentUserMessage && <img src={`/static/${anotherUserFace}`} alt="Platonos" className="plato" />}
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: isAuthor ? Colors.main : '#000', marginBottom: '3px' }}>{text}</p>
                <p style={{ fontSize: '10px', fontStyle: 'italic' }} >
                  {moment(m.createdAt).fromNow()}
                </p> 
              </div>   
            </div>          
          )
        })}
      </div>
    )
  }

  renderMessagesForPublic = () => {
    const { messages, authorId } = this.props
    return (
      <div>
        {messages.map(m => {
          const isAuthor = m.createdByUserId === authorId
          const platoFace = isAuthor ? 'plato-red.jpg' : 'plato.jpg'

          const text = insert_anchor(m.text)

          return (
            <div
              key={m.id} className="msg-list"
              style={{ marginLeft: isAuthor ? '40%' : '0', marginRight: isAuthor ? '0' : '40%' }}
            >
              <img src={`/static/${platoFace}`} alt="Platonos" className="plato" />
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: isAuthor ? Colors.main : '#000', marginBottom: '3px' }}>{text
                }</p>
                <p style={{ fontSize: '10px', fontStyle: 'italic' }} >
                  {moment(m.createdAt).fromNow()}
                </p>
              </div> 
            </div>          
          )
        })}
      </div>
    )
  }
  
  render() {
    const { currentUserId, userIds } = this.props
    return (
      <div>
        {
          userIds.indexOf(currentUserId) > -1 ?
          this.renderMessagesForParticipant()
          :
          this.renderMessagesForPublic()
        }
        {this.props.isClosed && 
          <div>
            <br />
            <div className="end-of-chat">...End of chat...</div>
          </div>
        }
        <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
        </div>
        <style jsx global>{`
          .msg-list {
            display: flex;
            flex-direction: row;
            word-break: break-word;
          }
          .end-of-chat {
            font-style: italic;
            font-size: 14px;
            color: gray;
            text-align: center;
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
  userIds: PropTypes.array.isRequired,
  authorId: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
  currentUserId: PropTypes.string,
  isClosed: PropTypes.bool.isRequired,
}

export default MessageList
