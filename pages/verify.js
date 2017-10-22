import React, { Component } from 'react';
import Head from "next/head"
import Router from "next/router"
import { graphql, gql, compose } from 'react-apollo'

import Page from "../layouts/main"
import withData from '../lib/withData'

class VerifyPage extends Component {

  static async getInitialProps({ query }) {
    return { verificationCode: query.verificationCode }
  }

  constructor(props) {
    super(props)
    this.state = {
      isVerifying: false,
      error: null,
    }
  }

  componentDidMount() {
    this.verifyUser()
  }

  verifyUser = async () => {
    if (!this.props.verificationCode) { 
      this.setState({
        error: "No verification code found."
      })
      Router.push('/')
      return; 
    }
    if (this.state.isVerifying) { return; }
    this.setState({
      isVerifying: true,
      error: null,
    })
    try {
      const verifyUser = await this.props.verifyUserMutation({
        variables: {
          verificationCode: this.props.verificationCode,
        }
      })
      if (verifyUser.verifyUser.username) {
        alert(`Successfully verify ${verifyUser.username}. Proceed to login.`)
        Router.push('/join')
      } else {
        throw 'Internal Error: no username found.'
      }
      this.setState({
        isVerifying: false,
        error: null,
      })
    } catch (err) {
      this.setState({
        isVerifying: false,
        error: (err.graphQLErrors 
          && err.graphQLErrors.length >= 1 
          && (err.graphQLErrors[0].functionError || err.graphQLErrors[0].message)
        || err),
      })
      alert('Oops: ' + this.state.error)
      Router.push('/')
    }
  }

  render() {
    const { isVerifying, error } = this.state
    return (
      <Page>
        <Head>
          <title>Platonos</title>
        </Head>
        <div>{isVerifying && "Verifying user..."}</div>
        <div>{error && "" + error}</div>
      </Page>
    );
  }
}

const VERIFY_USER_MUTATION = gql`
  mutation verifyUser($verificationCode: String!) {
    verifyUser(verificationCode: $verificationCode) {
      username
    }
  }
`

export default withData(graphql(VERIFY_USER_MUTATION, { name: "verifyUserMutation" })(VerifyPage));
