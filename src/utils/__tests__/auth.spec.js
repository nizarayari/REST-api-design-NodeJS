import { newToken, verifyToken, signup, signin, protect } from '../auth'
import jwt from 'jsonwebtoken'
import config from '../../config'
// import { UserModel } from '../../resources/user/model'

describe('Authentication:', () => {
  // const User = new UserModel()
  // REVIEW:
  // Since two UserModel instances existing at the same time impacts the test
  // results, I remove the instance in the test, and use the instance initiated
  // in auth.js for all the tests instead. However, I am not sure if that is a
  // good pratice or not, since we will have some tests depending on others, and
  // later when we test the HTTP response we cannot access the UserModel
  // instance, therefore, we set the expected values manually, e.g. magic number
  // of the user ID...
  describe('newToken', () => {
    test('creates new jwt from user', () => {
      const id = 123
      const token = newToken({ id })
      const user = jwt.verify(token, config.secrets.jwt)

      expect(user.id).toBe(id)
    })
  })

  describe('verifyToken', () => {
    test('validates jwt and returns payload', async () => {
      const id = 1234
      const token = jwt.sign({ id }, config.secrets.jwt)
      const user = await verifyToken(token)
      expect(user.id).toBe(id)
    })
  })

  describe('signup', () => {
    test('requires email and password', async () => {
      expect.assertions(2)

      const req = { body: {} }
      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await signup(req, res)
    })

    test('creates user and and sends new token from user', async () => {
      expect.assertions(2)

      const req = { body: { email: 'hello@hello.com', password: '293jssh' } }
      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        async send(result) {
          let user = await verifyToken(result.token)
          expect(user.email).toBe('hello@hello.com')
        }
      }

      await signup(req, res)
    })
  })

  describe('signin', () => {
    test('requires email and password', async () => {
      expect.assertions(2)

      const req = { body: {} }
      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await signin(req, res)
    })

    test('user must be real', async () => {
      expect.assertions(2)

      const req = { body: { email: 'hello@me.com', password: '293jssh' } }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await signin(req, res)
    })

    test('passwords must match', async () => {
      expect.assertions(2)

      const req = { body: { email: 'hello@hello.com', password: 'wrong' } }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await signin(req, res)
    })

    test('creates new token', async () => {
      expect.assertions(2)
      const fields = {
        email: 'hello@hello.com',
        password: '293jssh'
      }

      const req = { body: fields }
      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        async send(result) {
          let user = await verifyToken(result.token)
          expect(user.id).toBe(0) // REVIEW: Not sure if it is a good idea to put magic number here
        }
      }

      await signin(req, res)
    })
  })

  describe('protect', () => {
    test('looks for Bearer token in headers', async () => {
      expect.assertions(2)

      const req = { headers: {} }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await protect(req, res)
    })

    test('token must have correct prefix', async () => {
      expect.assertions(2)

      let req = { headers: { authorization: newToken({ id: '123sfkj' }) } }
      let res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await protect(req, res)
    })

    test('must be a real user', async () => {
      const token = `Bearer ${newToken({ id: 1 })}`
      const req = { headers: { authorization: token } }

      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await protect(req, res)
    })

    test('finds user form token and passes on', async () => {
      let token
      const fields = {
        email: 'hello@hello.com',
        password: '293jssh'
      }
      const res = {
        status(status) {
          return this
        },
        async send(result) {
          token = result.token
        }
      }

      await signin({ body: fields }, res)
      // REVIEW:
      // Depending on the signin function, so, another test. Is this the case?

      const authorization = `Bearer ${token}`
      const req = { headers: { authorization: authorization } }
      const next = () => {}
      await protect(req, {}, next)
      expect(req.user.id).toBe(0)
      expect(req.user).not.toHaveProperty('password')
    })
  })
})
