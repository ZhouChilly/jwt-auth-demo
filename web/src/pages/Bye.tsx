import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import { useByeQuery } from '../generated/graphql'


const Bye: React.FC<RouteComponentProps> = () => {
  const { data, loading, error } = useByeQuery({ fetchPolicy: 'network-only' })

  if (loading) {
    return <div>loading...</div>
  }

  if (error) {
    console.log('bye err', error)
    return <div>error</div>
  }

  if (!data) {
    return <div>no data</div>
  }

  return (
    <div>{data.bye}</div>
  )
}

export default Bye
