import request from 'supertest'
import { app } from '../server'
import { UserModel } from '../resources/user/model'
import { newToken } from '../utils/auth'

describe('API Authentication:', () => {
  const User = new UserModel()
  let token
  beforeEach(async () => {
    const user = User.create({ email: 'a@a.com', password: 'hello' })
    token = newToken(user)
  })

  describe('api auth', () => {
    test('api should be locked down', async () => {
      const response = await request(app).get('/api/user')
      expect(response.statusCode).toBe(401)
    })

    test('passes with JWT', async () => {
      const jwt = `Bearer ${token}`
      const result = await request(app)
        .get('/api/user')
        .set('Authorization', jwt)

      expect(result.statusCode).not.toBe(401)
    })
  })
})
