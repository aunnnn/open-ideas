import React, { Component } from 'react';
import { CHATROOM_STATE_TYPES } from '../constants'

class ChatroomEmptyMessage extends Component {

  static propTypes = {
    chatroom: React.PropTypes.object.isRequired,
    currentUserId: React.PropTypes.string.isRequired,
  }

  render() {
    const chatroom = this.props.chatroom
    if (!chatroom) return <div>...Loading...</div>
    switch (chatroom.stateType) {
    case CHATROOM_STATE_TYPES.created:
      return <div>We're looking for a match....</div>
    
    case CHATROOM_STATE_TYPES.invited:
    if (chatroom.invitedUser.id === this.props.currentUserId) {
      return (
        <div>
          <h3 className="title">You are invited to chat! 🎉</h3>
          <br />
          <p className="question">Do you want to talk?</p>
          {/* <br /> */}
          <div className="invitation-actions-container">
            <a style={{ color: 'blue' }}>✔ Yes, start this chat.</a>
            <a style={{ color: 'blue' }}>✖ No, I do not feel comfortable discussing this topic.</a>
            <a style={{ color: '#d87511' }}>🙁 Report, This topic seems inappropriate, random or not suitable to the community.</a>
          </div>
          <style jsx>{`
            .title {
              background: #dce2ed;
              padding: 8px;
              text-align: center;
            }
            .question {
              font-size: 18px;
            }
            .invitation-actions-container a {
              margin-top: 12px;
              display: block;
              font-size: 15px;
              color: green;
            }

            .invitation-actions-container a:hover {                            
              font-weight: bold;
              font-size: 17px;
            }
          `}</style>

        </div>
      )
    } else {
      return <div>Your match is already invited.</div>
    }
    case CHATROOM_STATE_TYPES.active:
      return <div>This room is empty.</div>
    case CHATROOM_STATE_TYPES.closed:
      return <div>This room is closed and empty 😭</div>
    default: 
      return <div>This room is empty.</div>
    }
  }
}

export default ChatroomEmptyMessage;
