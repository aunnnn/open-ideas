import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { withApollo, gql } from 'react-apollo'
import fetch from 'isomorphic-fetch'
import some from 'lodash/some'
import moment from 'moment'

import { FIRSTLOAD_USER_CHATROOMS_QUERY } from '../graphql/UserChatrooms'
import { CHATROOM_STATE_TYPES, PLATONOS_API_ENDPOINT, MAXIMUM_TOPIC_CHARACTERS_LENGTH, DAILY_CREATE_CHAT_QUOTA } from '../constants'
import { computeSlugFromChatTitleAndID } from '../utils/misc'
import UserChatroomFragment from '../graphql/UserChatroomFragment'
import { CHECK_USER_TOTAL_CREATED_CHATS, GET_USER_AND_CHECK_USER_TOTAL_CREATED_CHATS } from '../graphql/UserQuery'

class NewChat extends Component {
  
  constructor(props) {
    super(props);
    this.state = { 
      title: '',
      insertingNewTopic: false,
    }
  }

  onCreateChat = async (e) => {
    e.preventDefault()

    // Trim whitespaces & sanitize
    const topic = this.state.title.replace(/^[ ]+|[ ]+$/g,'')

    if (!confirm(`Are you sure to submit this topic?\n"${topic}"`)) return
    if (this.state.insertingNewTopic) { 
      alert('Please wait...')
      return 
    }

    this.setState({
      insertingNewTopic: true,
    })

    const currentUserId = this.props.currentUserId

    if(!currentUserId) {
      alert('You must log in first.')
      this.setState({
        insertingNewTopic: false,
      })
      return
    }

    try {
      const randomUser = await fetch(`${PLATONOS_API_ENDPOINT}/getRandomUser/${currentUserId}`)
      const anotherUser = await randomUser.json()
      if (!anotherUser.user) {
        throw "Something wrong. We can't find another user right now, please try again later."
      }

      const date_gte = moment().startOf('day').toISOString()
      const date_lte = moment().endOf('day').toISOString()
      const { data: { _allChatroomsMeta: { count: totalChatroomsCreatedToday } } } = await this.props.client.query({
        query: CHECK_USER_TOTAL_CREATED_CHATS,
        variables: {
          userId: currentUserId,
          date_gte,
          date_lte,
        }
      })

      if (totalChatroomsCreatedToday >= DAILY_CREATE_CHAT_QUOTA) {
        throw "Sorry, you have no quota left to create a talk today. Please try again tomorrow."
      }

      const anotherUserId = anotherUser.user.gc_id   
      const dateString = (new Date()).toISOString()
      const { data: { createChatroom: { id } } } = await this.props.client.mutate({
        mutation: CREATE_CHAT_MUTATION,
        variables: {
          title: topic,
          userIds: [currentUserId, anotherUserId],
          createdById: currentUserId,
          invitedUserId: anotherUserId,
          latestMessagesAt: dateString,
          stateType: CHATROOM_STATE_TYPES.invited,
      },
        // You may simply use this, in which case we don't need to update the store manually in 'update'
        // But this is slower.
        // refetchQueries: [
        //   {
        //     query: FIRSTLOAD_CHATROOMS_QUERY,
        //   },
        //   {
        //     query: FIRSTLOAD_USER_CHATROOMS_QUERY,
        //     variables: {
        //       forUserId: currentUserId,
        //     }
        //   }
        // ],
        optimisticResponse: {
          __typename: 'Mutation',
          createChatroom: {
            __typename: 'Chatroom',
            id: '',
            title: topic,
            createdAt: dateString,
            _messagesMeta: {
              __typename: 'QueryMeta',
              count: 0,
            },
            users: [
              {
                __typename: 'User',
                id: currentUserId,
              }, 
              {
                __typename: 'User',
                id: anotherUserId,
              },
            ],
            invitedUser: {
              __typename: 'User',
              id: anotherUserId,
            },
            createdBy: {
              __typename: 'User',
              id: currentUserId,
            },
            deniedByUserIds: [],
            stateType: CHATROOM_STATE_TYPES.invited,
            latestMessagesAt: dateString,
            savedByUsers: [],
          }
        },
        update: (store, { data: { createChatroom }}) => {
          // Update the store (so that the graphql components across the app will get updated)

          // Why doesn't it be smart and update all 'related' queries & components !??
          // https://github.com/apollographql/apollo-client/issues/1697
          function updateChatroomsQuery(query, variables) {
            try  {
              // All chatlist
              // 1. read from store
              const allChatroomsData = store.readQuery({
                query,
                variables,
              })
  
              // Must update messagesMeta manually, since the newly added object doesn't has one
              createChatroom._messagesMeta = {
                count: 0,
                __typename: '_QueryMeta',
              }
  
              if (some(allChatroomsData.allChatrooms, c => c.id === createChatroom.id)) {
                // Already exists
                return
              }

              // 2. append at first position
              allChatroomsData.allChatrooms.unshift(createChatroom)
              allChatroomsData._allChatroomsMeta.count += 1
  
              // 3. write back
              store.writeQuery({
                query,
                data: allChatroomsData,
                variables,
              })
            } catch (err) {
              // Probably query allChatrooms doesn't exist. (e.g., in case user enters directly to '/talk' page)
              // console.log('Err', err)
            }
          }

          updateChatroomsQuery(FIRSTLOAD_USER_CHATROOMS_QUERY, {
            forUserId: currentUserId,
          })

          // Update total count
          try {
            const data = store.readQuery({
              query: GET_USER_AND_CHECK_USER_TOTAL_CREATED_CHATS,
              variables: {
                userId: currentUserId,
                date_gte,
                date_lte,
              }
            })
            data._allChatroomsMeta.count += 1
            store.writeQuery({
              query: GET_USER_AND_CHECK_USER_TOTAL_CREATED_CHATS,
              variables: {
                userId: currentUserId,
                date_gte,
                date_lte,
              },
              data,
            })
          } catch (err) {
            console.log('Err updating store: ', err)
          }
        },
      })
      
      // Update invited
      await fetch(`${PLATONOS_API_ENDPOINT}/updateUserLastInvitedAt/${anotherUserId}`)

      const title = this.state.title + ''
      this.setState({
        title: '',
        insertingNewTopic: false,
      })
      const newChatroomSlug = computeSlugFromChatTitleAndID(title, id)
      this.props.onCreateNewChatroom(newChatroomSlug)
      
      const totalChatroomsLeft = DAILY_CREATE_CHAT_QUOTA - (totalChatroomsCreatedToday+1)
      let leftMessage
      if (totalChatroomsLeft === 0) {
        leftMessage = 'You have no quota left to create a talk today.'
      } else if (totalChatroomsLeft === 1) {
        leftMessage = 'You can create one more talk today.'
      } else {
        leftMessage = `You have ${totalChatroomsLeft} talks left for today.`
      }
      alert(`Successfully create new talk! ${leftMessage}`)
    } catch(err) {
      if (err.graphQLErrors) {
        alert("Oops: " + err.graphQLErrors[0].functionError || err.graphQLErrors[0].message);
      } else {
        alert(err)
      }
      this.setState({
        insertingNewTopic: false,
      })
    }
  }

  render() { 
    const topic = this.state.title
    const isOverMaximumChars = topic.length > MAXIMUM_TOPIC_CHARACTERS_LENGTH
    const confirmDisabled = !topic || topic.replace(/\s/g, '').length === 0 || this.state.insertingNewTopic || isOverMaximumChars
    const charactersLeft = MAXIMUM_TOPIC_CHARACTERS_LENGTH - topic.length
    
    return (
      <div>
        <Head>
          <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/1.0.2/purify.min.js" />
        </Head>
        <form className="main" onSubmit={confirmDisabled ? null : this.onCreateChat}>
          <input
              value={this.state.title}
              onChange={e => this.setState({ title: e.target.value})}
              placeholder="insert a topic here"
              type="text"
              className="add-chat-input"
          />
          
          <button
              className="primary-button"
              type="submit"
              disabled={confirmDisabled}
          >
              Create talk
          </button>
        </form>
        {topic.length > 0 && <p className="chars-left">Characters left: {charactersLeft}</p>}
        <style jsx>{`
          .add-chat-input {
            order: 0;
            flex-grow: 1;
          }

          .primary-button {
            order: 1;
            border: none;
            flex-grow: 0;        
          }

          .main {
            display: flex;
            flex-flow: row wrap;
            height: 30px;
          }

          .chars-left {
            margin-top: 4px;
            font-size: 12px;
            color: ${isOverMaximumChars ? 'red' : 'gray'};            
            font-weight: ${isOverMaximumChars ? 'bold' : 'normal'}
          }
        `}</style>
      </div>)
    }
}

const CREATE_CHAT_MUTATION = gql`
  mutation CreateChatroomMutation($title: String!, $createdById: ID!, $userIds: [ID!]!, $invitedUserId: ID!, $latestMessagesAt: DateTime!, $stateType: Int!) {
    createChatroom(
      title: $title, 
      usersIds: $userIds, 
      createdById: $createdById, 
      stateType: $stateType,
      invitedUserId: $invitedUserId,
      latestMessagesAt: $latestMessagesAt,
    ) {
      ...UserChatroom
    }
  }

  ${UserChatroomFragment}
`

NewChat.propTypes = {
  currentUserId: PropTypes.string.isRequired,
  currentUsername: PropTypes.string.isRequired,
}

export default withApollo(NewChat)
