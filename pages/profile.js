import Head from "next/head"
import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo'
import moment from 'moment'

import CURRENT_USER_QUERY from '../graphql/UserQuery'
import Page from "../layouts/main"
import withData from '../lib/withData'
import connectAuth from '../lib/connectAuth'

class ProfilePage extends Component {

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
      <div>
        <p>Your account was created {moment(User.createdAt).fromNow()}</p>
        <br/>
        {
          User.savedChatrooms.length === 0 ?
          <div>No saved talks</div>
          :
          <div>
            <h3>Saved ({User.savedChatrooms.length})</h3>
            {User.savedChatrooms.map(c => <div key={c.id}>{c.title}</div>)}
          </div>
        }
      </div>
    )
  }

  render() {
    const { currentUsername, currentUserQuery: { loading, error } } = this.props
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
    }
  })
)(ProfilePage))
export default withData(ProfilePageWithGraphQLAndAuth)
