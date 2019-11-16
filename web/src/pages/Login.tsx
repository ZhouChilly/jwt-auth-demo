import React, {useState} from 'react'
import { RouteComponentProps } from 'react-router-dom'

import {MeDocument, MeQuery, useLoginMutation} from '../generated/graphql'
import { setAccessToken } from '../accessToken'


const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login] = useLoginMutation()

  const handleFormSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    const { data } = await login({
      variables: {
        email,
        password
      },
      update: (store, { data }) => {
        if (!data) { return null }
        store.writeQuery<MeQuery>({
          query: MeDocument,
          data: {
            __typename: 'Query',
            me: data.login.user
          }
        })
      }
    })
    console.log('login data', data)

    if (data) {
      setAccessToken(data.login.accessToken)
    }

    history.push('/')
  }

  return (
    <form
      onSubmit={handleFormSubmit}
    >
      <div>
        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value)
          }}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value)
          }}
        />
      </div>
      <div>
        <button type="submit">login</button>
      </div>
    </form>
  )
}

export default Login
