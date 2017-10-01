export const loggedIn = (token, userId, username) => ({
  type: 'LOGGED_IN',
  payload: {
    authToken: token,
    currentUserId: userId,
    currentUsername: username,
  },
})

export const loggedOut = () => ({
  type: 'LOGGED_OUT',
  payload: null,
})
