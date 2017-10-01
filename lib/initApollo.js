import { ApolloClient, createNetworkInterface } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import fetch from 'isomorphic-fetch'
import { loadState } from './localStorage'

let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

function create (initialState, withSubscription = false) {
  const networkInterface = createNetworkInterface({
    uri: 'https://api.graph.cool/simple/v1/cj7xevxnc0yd20168ieas984x', // Server URL (must be absolute)
    opts: { // Additional fetch() options like `credentials` or `headers`
      credentials: 'same-origin'
    }
  })
  
  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {}
      }
      const state = loadState()
      if (process.browser && state) {        
        const token = state.authReducers.authData && state.authReducers.authData.authToken
        req.options.headers.authorization = (token) ? `Bearer ${token}` : null
      }      
      next()
    }
  }])


  if (withSubscription) {
    const getToken = () => {
      if (process.browser) {
        const state = loadState()
        return state.authReducers.authData && state.authReducers.authData.authToken
      }
      return null
    }

    const wsClient = new SubscriptionClient('wss://subscriptions.ap-northeast-1.graph.cool/v1/cj7xevxnc0yd20168ieas984x', {
      reconnect: true,
      connectionParams: {
        authToken: getToken
      }
    })
  
    const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
      networkInterface,
      wsClient
    )

    return new ApolloClient({
      initialState,
      ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
      networkInterface: networkInterfaceWithSubscriptions,
      dataIdFromObject: o => o.id,
    })
  }
  
  return new ApolloClient({
    initialState,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    networkInterface,
    dataIdFromObject: o => o.id,
  })
}

export default function initApollo (initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState, true)
  }

  return apolloClient
}
