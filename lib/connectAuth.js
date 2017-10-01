import { connect } from 'react-redux'

export default connect((state) => {
  const authData = state.authReducers.authData
  return {
    isLoggedIn: state.authReducers.isLoggedIn,
    authToken: authData && authData.authToken,
    currentUsername: authData && authData.currentUsername,
    currentUserId: authData && authData.currentUserId,  
  }  
}, null)
