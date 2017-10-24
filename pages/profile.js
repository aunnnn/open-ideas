import Head from "next/head"
import Router from "next/router"
import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo'
import moment from 'moment'

import Colors from '../utils/Colors'
import CURRENT_USER_QUERY from '../graphql/UserQuery'
import Page from "../layouts/main"
import withData from '../lib/withData'
import connectAuth from '../lib/connectAuth'
import { computeSlugFromChatTitleAndID } from '../utils/misc'
class ProfilePage extends Component {

  onClickSavedListItem = (title, id) => {
    const slug = computeSlugFromChatTitleAndID(title, id)
    Router.push(`/?slug=${slug}`, `/read/${slug}`, { shallow: true })
  }

  renderLoaded = () => {
    const { currentUserQuery: { User, error } } = this.props
    if (error) {
      return (
        <div>
          <p>Oops! An error occurred: {error}</p>
        </div>
      )
    }
    return (
      <div className="main">
        <p className="create-date">Your account was created {moment(User.createdAt).fromNow()}</p>
        <br/>
        {
          User.savedChatrooms.length === 0 ?
          <div>No saved talks</div>
          :
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
          .create-date {
            font-size: 14px;
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
  graphql(CURRENT_USER_QUERY, { 
    name: "currentUserQuery",
    options: props => {
      return {
        variables: {
          userId: props.currentUserId,
        }
      }
    },
    skip: ({ currentUserId }) => {
      return currentUserId ? false : true
    }
  })
)(ProfilePage))
export default withData(ProfilePageWithGraphQLAndAuth)
