import React, { Component } from 'react';
import { graphql, gql, compose } from 'react-apollo'
import Head from 'next/head'
import Router from 'next/router'

import Page from '../layouts/main'
import withData from '../lib/withData'

import { GC_AUTH_TOKEN, GC_USER_ID, GC_USERNAME } from '../constants'

class LoginPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loginMode: true,
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
        const _id = result.data.signinUser.user.id
        const _token = result.data.signinUser.token
        const _username = result.data.signinUser.user.username
        this._saveUserData(_id, _token, _username)
      } else {
        const { username, email, password } = this.state
        const result = await this.props.createUserMutation({
          variables: {
            username,
            email,
            password
          }
        })
        const _id = result.data.signinUser.user.id
        const _token = result.data.signinUser.token
        const _username = result.data.signinUser.user.username
        this._saveUserData(_id, _token, _username)
        alert('👋 Successfully created account.')        
      }
      Router.push({
        pathname: '/'        
      })
    } catch(err) {
      alert("Oops: " + err.graphQLErrors[0].message);      
      this.setState({
        loading: false
      })
    }
  }

  _saveUserData = (id, token, username) => {
    localStorage.setItem(GC_USER_ID, id)
    localStorage.setItem(GC_AUTH_TOKEN, token)
    localStorage.setItem(GC_USERNAME, username)
  }

  render() { 
    const pageTitle = this.state.loginMode ? 'Login' : 'Sign Up'
    const confirmDisabled = !this.state.email || !this.state.password || (!this.state.loginMode && !this.state.username)
    return (
      <Page>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <form className="main" onSubmit={confirmDisabled ? null : this.onConfirm}>
          <h4>{pageTitle}</h4>
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
                onClick={() => this.setState({ loginMode: !this.state.loginMode })}
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
        <style jsx>{`          
          .main input {
            display: block;
            margin: 8px 0;
          }

          .change-mode-button {
            cursor: pointer;
            margin-top: 20px;
            font-size: 16px;
          }
        `}</style>
      </Page>)
  }
}
 
const CREATE_USER_MUTATION = gql`
mutation CreateUserMutation($username: String!, $email: String!, $password: String!) {
  createUser(
    username: $username,
    authProvider: {
      email: {
        email: $email,
        password: $password
      }
    }
  ) {
    id
    username
  }

  signinUser(email: {
    email: $email,
    password: $password
  }) {
    token
    user {
      id
      username
    }
  }
}
`

const SIGNIN_USER_MUTATION = gql`
mutation SigninUserMutation($email: String!, $password: String!) {
  signinUser(email: {
    email: $email,
    password: $password
  }) {
    token
    user {
      id
      username
    }
  }
}
`

export default withData(compose(
  graphql(CREATE_USER_MUTATION, { name: 'createUserMutation'}),
  graphql(SIGNIN_USER_MUTATION, { name: 'signinUserMutation'})
)(LoginPage));
