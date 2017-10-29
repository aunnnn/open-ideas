import React, { Component } from 'react';
import Router from 'next/router'
import { Router as CustomRouter } from '../routes'
import { connect } from 'react-redux';

import { graphql, gql, compose } from 'react-apollo'
import Head from 'next/head'

import { loggedIn } from '../lib/authActions'

import Page from '../layouts/main'
import withData from '../lib/withData'
import { logEvent } from '../lib/analytics'

class LoginPage extends Component {

  static async getInitialProps({ asPath }) {
    // Either user comes throguh '/join' or '/login'
    return {
      isInitialLoginMode: asPath === '/login'
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      loginMode: props.isInitialLoginMode ? true : false,
      email: '',
      password: '',
      username: '',
      loading: false,
    }
  }

  onConfirm = async (e) => {    
    e.preventDefault()
    this.setState({
      loading: true
    })
    
    try {
      if (this.state.loginMode) {
        const { email, password } = this.state
        const result = await this.props.signinUserMutation({
          variables: {
            email,
            password
          }
        })
        const _id = result.data.authenticateUser.id
        const _token = result.data.authenticateUser.token
        const _username = result.data.authenticateUser.username
        this._saveUserDataToStore(_token, _id, _username)
      } else {
        const { username, email, password } = this.state
        const result = await this.props.createUserMutation({
          variables: {
            username,
            email,
            password
          }
        })
        // const _id = result.data.signupUser.id
        // const _token = result.data.signupUser.token
        // const _username = result.data.signupUser.username
        // this._saveUserDataToStore(_token, _id, _username)
        alert('👋 Successfully created account. Please check your email and click on the confirmation link.')        
      }
      Router.push({
        pathname: '/'        
      })
    } catch(err) {
      alert("Oops: " + (
        err.graphQLErrors 
          && err.graphQLErrors.length >= 1 
          && (err.graphQLErrors[0].functionError || err.graphQLErrors[0].message)) 
        || err); 
      
      this.setState({
        loading: false
      })
    }
  }

  _saveUserDataToStore = (token, id, username) => {
    this.props.onLoggedIn(token, id, username)
  }

  render() { 
    const pageTitle = this.state.loginMode ? 'Login' : 'Join Platonos'
    const confirmDisabled = !this.state.email || !this.state.password || (!this.state.loginMode && !this.state.username)
    return (
      <Page>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <div className="main">
          <h1>{pageTitle}</h1>
          <form onSubmit={confirmDisabled ? null : this.onConfirm}>
            <br />
            {/* If sign up mode */
              !this.state.loginMode &&
              <input 
                value={this.state.username}
                onChange={(e) => this.setState({ username: e.target.value })}
                type="text"
                placeholder="username"
              />
            }
            <input
              value={this.state.email}
              onChange={(e) => this.setState({ email: e.target.value })}
              type="email"
              placeholder="email address"
            />
            <input
              value={this.state.password}
              onChange={(e) => this.setState({ password: e.target.value })}
              type="password"
              placeholder={this.state.loginMode ? 'Your password' : 'Choose a safe password'}
            />                  
            {!this.state.loading ?
              <div>
                <button
                  type="submit" 
                  className="primary-button"
                  disabled={confirmDisabled}
                >
                  {this.state.loginMode ? 'login' : 'create account'}
                </button>
                <div
                  className="change-mode-button"
                  onClick={() => {
                    logEvent('Join', this.state.loginMode ? 'Signup' : 'Login')
                    const nextPath = this.state.loginMode ? '/join' : '/login'
                    CustomRouter.pushRoute(nextPath)
                    this.setState({ loginMode: !this.state.loginMode })
                  }}
                >
                  {this.state.loginMode ? 'need to create an account?' : 'already have an account?' }
                </div>
              </div>
              :
              <div>
                👀 
              </div>
            }
          </form>
        </div>
        <style jsx>{`  
          .main {
            margin: 8px;
          }        

          .main input {
            display: block;
            margin: 8px 0;
          }

          .change-mode-button {
            cursor: pointer;
            margin-top: 20px;
            font-size: 16px;
            color: blue;
          }
        `}</style>
      </Page>)
  }
}
 
const CREATE_USER_MUTATION = gql`
mutation CreateUserMutation($username: String!, $email: String!, $password: String!) {
  signupUser(
    email: $email,
    password: $password,
    username: $username,
  ) {
    id
  }
}
`

const SIGNIN_USER_MUTATION = gql`
mutation SigninUserMutation($email: String!, $password: String!) {
  authenticateUser(
    email: $email, 
    password: $password
  ) {
    token
    id
    username
  }
}
`

const LoginPageWithState = connect(
  null,
  (dispatch) => ({
    onLoggedIn(token, id, username) {
      dispatch(loggedIn(token, id, username))
    }
  })
)(LoginPage)

export default withData(compose(
  graphql(SIGNIN_USER_MUTATION, { name: 'signinUserMutation'}),
  graphql(CREATE_USER_MUTATION, { name: 'createUserMutation'}),
)(LoginPageWithState))
