import request from 'supertest'
import { app } from '../server'
import { Users } from '../resources/user/model'
import { newToken } from '../utils/auth'

describe('API Authentication:', () => {
  let token
  beforeEach(async () => {
    const user = Users.create({ email: 'a@a.com', password: 'hello' })
    token = newToken(user)
  })

  afterEach(async () => {
    Users.users = []
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
