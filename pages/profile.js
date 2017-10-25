import Head from "next/head"
import Router from "next/router"
import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo'
import moment from 'moment'

import { GET_USER_AND_CHECK_USER_TOTAL_CREATED_CHATS } from '../graphql/UserQuery'
import Page from "../layouts/main"
import withData from '../lib/withData'
import connectAuth from '../lib/connectAuth'
import { computeSlugFromChatTitleAndID } from '../utils/misc'
import { DAILY_CREATE_CHAT_QUOTA } from '../constants'
class ProfilePage extends Component {

  onClickSavedListItem = (title, id) => {
    const slug = computeSlugFromChatTitleAndID(title, id)
    Router.push(`/?slug=${slug}`, `/read/${slug}`, { shallow: true })
  }

  renderLoaded = () => {
    const { currentUserQuery: { User, _allChatroomsMeta: { count: totalChatsCreatedToday }, error } } = this.props
    if (error) {
      return (
        <div>
          <p>Oops! An error occurred: {error}</p>
        </div>
      )
    }
    return (
      <div className="main">
        <br/>
        <p>
          Talks left: <span className="talks-left">{DAILY_CREATE_CHAT_QUOTA - totalChatsCreatedToday} / {DAILY_CREATE_CHAT_QUOTA}</span>
          <span className="renew-date">({moment().startOf('day').format('DD/MM/YYYY')})</span>
        </p>
        <br/>
        {
          User.savedChatrooms.length !== 0 &&
          <div>
            <h3>Saved ({User.savedChatrooms.length})</h3>
            <div className="saved-list">
              {User.savedChatrooms.map(c => (
                <div className="saved-list-item" key={c.id} onClick={() => this.onClickSavedListItem(c.title,c.id)}>
                  <p>{c.title} <span>({c._messagesMeta.count})</span></p>
                </div>
              ))}
            </div>
          </div>
        }
        <style jsx>{`
          .talks-left {
            font-size: 18px;
          }
          .saved-list {
            margin-top: 4px;
          }
          .saved-list-item {
            cursor: pointer;
            padding: 4px;
          }
          .saved-list-item:hover {
            cursor: pointer;
            text-decoration: underline;
          }
          .saved-list-item span {
            font-size: 12px;
          }
          .renew-date {
            font-size: 12px;
            color: gray;
            margin-left: 18px;
          }
        `}</style>
      </div>
    )
  }

  render() {
    const { currentUsername, currentUserQuery } = this.props
    let loading;
    if (currentUserQuery) {
      loading = currentUserQuery.loading
    } else {
      loading = true
    }
    return (
      <Page>
        <Head>
          <title>Profile</title>
        </Head>
        <div className="container">
          <h1>{currentUsername}</h1>
          {!loading && this.renderLoaded() }
        </div>
        <style jsx>{`
          .container {
            margin: 8px;
          }
        `}</style>
      </Page>
    );
  }
}

const ProfilePageWithGraphQLAndAuth = connectAuth(compose(
  graphql(GET_USER_AND_CHECK_USER_TOTAL_CREATED_CHATS, { 
    name: "currentUserQuery",
    options: props => {
      return {
        variables: {
          userId: props.currentUserId,
          date_gte: moment().startOf('day').toISOString(),
          date_lte: moment().endOf('day').toISOString(),
        }
      }
    },
    skip: ({ currentUserId }) => {
      return currentUserId ? false : true
    }
  })
)(ProfilePage))
export default withData(ProfilePageWithGraphQLAndAuth)
