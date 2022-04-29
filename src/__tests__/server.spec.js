import request from 'supertest'
import { app } from '../server'
import { signup, verifyToken } from '../utils/auth'
//import { UserModel } from '../resources/user/model'

describe('API Authentication:', () => {
  // const User = new UserModel()
  // REVIEW:
  // Same thing here, we use the UserModel instance in auth.js
  let token
  describe('api auth', () => {
    test('api should be locked down', async () => {
      const response = await request(app).get('/api/user')
      expect(response.statusCode).toBe(401)
    })

    test('passes with JWT', async done => {
      const req = { body: { email: 'hello@me.com', password: 'foobar' } }
      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        async send(result) {
          let user = await verifyToken(result.token)
          expect(user.email).toBe('hello@me.com')
          token = result.token
        }
      }
      await signup(req, res)

      const jwt = `Bearer ${token}`
      const result = await request(app)
        .get('/api/user')
        .set('Authorization', jwt)

      expect(result.statusCode).not.toBe(401)
      done()
    })
  })
})
