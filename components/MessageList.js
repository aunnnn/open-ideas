import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import Colors from '../utils/Colors'
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

  render() {
    const { currentUserId, userIds, messages, authorId } = this.props
    const renderForParticipants = userIds.indexOf(currentUserId) > -1
    return (
      <div>
         <div>
          {messages.map(m => {         
            const isAuthor = m.createdByUserId === authorId 
            let renderMessageRightSide, platoFace;

            if (renderForParticipants) {
              renderMessageRightSide = m.createdByUserId === currentUserId
              platoFace = !renderMessageRightSide && currentUserId !== authorId ? 'plato-red.jpg' : 'plato.jpg'
            } else {
              renderMessageRightSide = isAuthor
              platoFace = isAuthor ? 'plato-red.jpg' : 'plato.jpg'
            }
  
            const text = insert_anchor(m.text, m.id)

            return (
              <div
                key={m.id}
                className={`msg-list ${renderMessageRightSide ? 'right-side':'left-side' }`}
              >
                {renderForParticipants ? 
                  (!renderMessageRightSide && <img src={`/static/${platoFace}`} alt="Platonos" className="plato" />)
                  :
                  <img src={`/static/${platoFace}`} alt="Platonos" className="plato" />}
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
          .end-of-chat {
            font-style: italic;
            font-size: 14px;
            color: gray;
            text-align: center;
          }

          .msg-list .plato {
            flex: 0 0;
            width: 37px;
            height: 52px;
            margin-right: 10px;
          }

          .msg-list {
            display: flex;
            flex-direciton: row;
            word-break: break-word;
          }

          .msg-list.left-side {
            margin-left: 0%;
            margin-right: 40%;
          }
          
          .msg-list.right-side {
            margin-left: 40%;
            margin-right: 0%;
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
