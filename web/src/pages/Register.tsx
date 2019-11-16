import React, {useState} from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { useRegisterMutation } from '../generated/graphql'


const Register: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [register] = useRegisterMutation()

  const handleFormSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    const { data } = await register({
      variables: {
        email,
        password
      }
    })
    console.log('register data', data)
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
        <button type="submit">register</button>
      </div>
    </form>
  )
}

export default Register
