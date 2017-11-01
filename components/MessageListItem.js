import React from 'react'
import PropTypes from 'prop-types'
import Colors from '../utils/Colors'
import { insert_anchor } from '../utils/transform'

const MessageListItem = ({ mid, isAuthorStyle, showPlatoFace, text, subText, linkDetectionEnabled=true, customTextStyle=null }) => {
  const platoFaceImagename = isAuthorStyle ? '/static/plato-red-small.jpg' : '/static/plato-small.jpg'
  const finalText = linkDetectionEnabled ? insert_anchor(text, mid) : text
  return (
    <div className="msg-list-item">
      <img src={platoFaceImagename} alt="Platonos" className={`plato ${!showPlatoFace ? 'hidden' : 'show'}`} />
      <div style={{ marginBottom: '15px' }}>
        <p style={customTextStyle || { color: isAuthorStyle ? Colors.main : '#000', marginBottom: '3px' }}>{finalText}</p>
        <p style={{ fontSize: '10px', fontStyle: 'italic' }} >{subText}</p> 
      </div>   
      <style jsx>{`
        .msg-list-item {
          display: flex;
          flex-direciton: row;
          word-break: break-word;
        }

        .msg-list-item .plato {
          flex: 0 0;
          width: 37px;
          height: 52px;
          min-width: 37px;
          min-height: 52px;
          margin-right: 10px;
        }
      `}</style>
    </div>
 )
}

MessageListItem.propTypes = {
  isAuthorStyle: PropTypes.bool.isRequired,
  showPlatoFace: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  subText: PropTypes.string,
  mid: PropTypes.string.isRequired,
  linkDetectionEnabled: PropTypes.bool,
  customTextStyle: PropTypes.object,
}

export default MessageListItem
