import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import MessageListItem from './MessageListItem'
import { insert_anchor } from '../utils/transform'

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
    const shouldUpdate = !this.arraysEqual(newMessages, messages)
    return shouldUpdate
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

  generateTextComponentFromMessage = (m) => {
    return insert_anchor(m.text, m.id)
  }

  render() {
    const { currentUserId, userIds, messages, authorId } = this.props
    const renderForParticipants = userIds.indexOf(currentUserId) > -1
    return (
      <div className="main">
         <div>
          {messages.map(m => {         
            const isAuthor = m.createdByUserId === authorId             
            const renderMessageRightSide = !renderForParticipants ? isAuthor : m.createdByUserId === currentUserId

            // show plato face on public message or the other user
            const showPlatoFace = !renderForParticipants || !renderMessageRightSide
            return (
              <div key={m.id} className={renderMessageRightSide ? 'msg-right-side' : 'msg-left-side'}>
                <MessageListItem 
                  mid={m.id}
                  isAuthorStyle={isAuthor}
                  showPlatoFace={showPlatoFace}
                  text={m.text}
                  subText={moment(m.createdAt).fromNow()}
                /> 
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

          .msg-left-side {
            margin-left: 0%;
            margin-right: 40%;
          }
          
          .msg-right-side {
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
