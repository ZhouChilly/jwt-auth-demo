import React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { useUsersQuery } from '../generated/graphql'


const Home: React.FC<RouteComponentProps> = () => {
  const { data } = useUsersQuery({ fetchPolicy: 'network-only' })

  if (!data) { return <div>loading...</div> }

  return (
    <div>
      <div>users:</div>
      <ul>
        {data.users.map(user => (
          <li key={user.id}>{user.email}, {user.id}</li>
        ))}
      </ul>
    </div>
  )
}

export default Home
