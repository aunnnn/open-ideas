import Head from "next/head"
import React, { Component } from 'react';
import { graphql, gql, compose } from 'react-apollo'
import moment from 'moment'

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

const CURRENT_USER_QUERY = gql`
  query getCurrentUser($userId: ID!) {
    User(id: $userId) {
      createdAt
      savedChatrooms {
        id
        title
      }
    }
  }
`

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
