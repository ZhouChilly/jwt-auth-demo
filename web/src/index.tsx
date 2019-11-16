import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import { ApolloLink, Observable } from 'apollo-link'
import { TokenRefreshLink } from 'apollo-link-token-refresh'
import jwtDecode from 'jwt-decode'

import App from './App'
import { getAccessToken, setAccessToken } from './accessToken'
import './index.css'

const cache = new InMemoryCache({})

const requestLink = new ApolloLink((operation, forward) =>
  new Observable(observer => {
    let handle: any;
    Promise.resolve(operation)
      .then((operation) => {
        const accessToken = getAccessToken()
        if (accessToken) {
          operation.setContext({
            headers: {
              authorization: `bearer ${accessToken}`
            }
          })
        }
      })
      .then(() => {
        handle = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch(observer.error.bind(observer));

    return () => {
      if (handle) handle.unsubscribe();
    };
  })
);

const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink({
      accessTokenField: 'accessToken',
      isTokenValidOrUndefined: () => {
        const accessToken = getAccessToken()
        if (!accessToken) { return true }

        try {
          const { exp } = jwtDecode(accessToken)
          return Date.now() < exp * 1000
        } catch (e) {
          return false
        }
      },
      fetchAccessToken: () => {
        return fetch('http://localhost:4000/refresh_token',{
          method: 'POST',
          credentials: 'include'
        })
      },
      handleFetch: accessToken => {
        setAccessToken(accessToken)
      },
      handleError: err => {
        console.warn('Your refresh token is invalid. Try to relogin', err);
      }
    }),
    onError(({ graphQLErrors, networkError }) => {
      console.log('graphQLErrors', graphQLErrors)
      console.log('networkError', networkError)
    }),
    requestLink,
    new HttpLink({
      uri: 'http://localhost:4000/graphql',
      credentials: 'include'
    })
  ]),
  cache
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)
