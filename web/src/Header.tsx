import React from 'react'
import { Link } from 'react-router-dom'
import { useLogoutMutation, useMeQuery } from './generated/graphql'
import { setAccessToken } from './accessToken'

const Header: React.FC = () => {
  const { data } = useMeQuery({ fetchPolicy: 'network-only' })
  const [logout, { client }] = useLogoutMutation()

  const handleLogoutBtnClick = async () => {
    await logout()
    setAccessToken('')
    client!.resetStore()
  }

  return (
    <header>
      <Link to="/">home</Link>
      <Link to="/register">register</Link>
      <Link to="/login">login</Link>
      <Link to="/bye">bye</Link>
      {data && data.me
        ? (<div>
            <span>{`you are logged as: ${data.me.email}`}</span>
            <button onClick={handleLogoutBtnClick}>logout</button>
          </div>)
        : (<div>not logged in</div>)
      }
    </header>
  )
}

export default Header
