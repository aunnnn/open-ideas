import React, {Component} from 'react'
import { GC_AUTH_TOKEN, GC_USERNAME, GC_USER_ID } from '../constants'

export default function withAuth(AuthComponent) {
  
  return class Authenticated extends Component {

    static async getInitialProps (ctx) {
      let initialProps = {}
      if (AuthComponent.getInitialProps) {
        initialProps = await AuthComponent.getInitialProps(ctx)
      }      
      return initialProps
    }

    constructor(props) {
      super(props)
      this.state = {        
        isLoggedIn: false,
        authToken: null,
        currentUsername: null,
        currentUserId: null,
        logout: this.logout,
      };
    }

    logout = () => {
      localStorage.removeItem(GC_AUTH_TOKEN)
      localStorage.removeItem(GC_USER_ID)
      localStorage.removeItem(GC_USERNAME)
      this.setState({        
        isLoggedIn: false,
        authToken: null,
        currentUsername: null,
        currentUserId: null,        
      })
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
      return <AuthComponent {...this.props} auth={this.state} />
    }
  }
}
