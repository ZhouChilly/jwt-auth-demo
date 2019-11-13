import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
  Int
} from 'type-graphql'
import { hash, compare } from 'bcryptjs'

import { User } from './entity/User'
import { MyContext } from './MyContext'
import { createAccessToken, createRefreshToken } from './auth'
import { isAuth } from './isAuthMiddleware'
import { sendRefreshToken } from './sendRefreshToken'
import { getConnection } from "typeorm"

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string
}

@Resolver()
export class UserResolvers {
  @Query(() => String)
  hello() {
    return 'hi'
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(
    @Ctx() { payload }: MyContext
  ) {
    console.log('payload', payload)
    return `your user id is ${payload!.userId}`
  }

  @Query(() => [User])
  users() {
    return User.find()
  }

  @Mutation(() => Boolean)
  async revokeTokenForUser(
    @Arg('userId', () => Int) userId: number
  ) {
    await getConnection().getRepository(User).increment(
      { id: userId },
      'tokenVersion',
      1
      )
    return true
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      throw new Error('could not find user')
    }

    const valid = await compare(password, user.password)

    if (!valid) {
      throw new Error('bad password')
    }

    // login successful
    sendRefreshToken(res, createRefreshToken(user))

    return {
      accessToken: createAccessToken(user)
    }
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {
    const hashedPassword = await hash(password, 12)
    try {
      await User.insert({
        email,
        password: hashedPassword,
      })
      return true
    } catch (err) {
      console.log('register err', err)
      return false
    }
  }
}
