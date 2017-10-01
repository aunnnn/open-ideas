export default {
  authReducers: (state = { isLoggedIn: false, authData: null }, { type, payload }) => {
    switch (type) {
      case 'LOGGED_IN':
        return {
          ...state,
          isLoggedIn: true,
          authData: {
            ...payload,
          }
        }
      case 'LOGGED_OUT':
        return {
          ...state,
          isLoggedIn: false,
          authData: null,
        }
      default:
        return state
    }

  }
}