import React, {Component} from 'react'
import { GC_AUTH_TOKEN, GC_USERNAME, GC_USER_ID } from '../constants'

export default function withAuth(AuthComponent) {
  
  return class Authenticated extends Component {
    constructor(props) {
      super(props)
      this.state = {        
        isLoggedIn: false,
        authToken: null,
        currentUsername: null,
        currentUserId: null,
      };
    }

    componentDidMount () {      
      this.setState({         
        isLoggedIn: localStorage.getItem(GC_AUTH_TOKEN) != null,
        authToken: localStorage.getItem(GC_AUTH_TOKEN),
        currentUsername: localStorage.getItem(GC_USERNAME),
        currentUserId: localStorage.getItem(GC_USER_ID),
      })
    }

    render() {      
      return (
        <div>
          <AuthComponent {...this.props} auth={{              
            ...this.state
          }} />
        </div>
      )
    }
  }
}
