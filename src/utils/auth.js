import config from '../config'
import { Users } from '../resources/user/model'
import jwt from 'jsonwebtoken'
import { UserError } from './error'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv()
addFormats(ajv)

const signinSingupSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' }
  },
  required: ['email', 'password'],
  additionalProperties: false
}

export const newToken = user => {
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const signup = async (req, res) => {
  const validate = ajv.compile(signinSingupSchema)
  if (!validate(req.body)) {
    return res.status(400).send({ message: 'need email and password' })
  }

  try {
    const user = await Users.create(req.body)
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (e) {
    if (e instanceof UserError) {
      res.status(401).end()
    }
    return res.status(500).end()
  }
}

export const signin = async (req, res) => {
  const validate = ajv.compile(signinSingupSchema)
  if (!validate(req.body)) {
    return res.status(400).send({ message: 'need email and password' })
  }

  const invalid = { message: 'Invalid email and passoword combination' }

  try {
    const user = Users.findOne(req.body.email)

    if (!user) {
      return res.status(401).send(invalid)
    }

    const match = Users.checkPassword(user.id, req.body.password)

    if (!match) {
      return res.status(401).send(invalid)
    }

    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}

export const protect = async (req, res, next) => {
  const bearer = req.headers.authorization

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end()
  }

  const token = bearer.split('Bearer ')[1].trim()
  let payload
  try {
    payload = await verifyToken(token)
  } catch (e) {
    return res.status(401).end()
  }

  const user = await Users.findById(payload.id)

  if (!user) {
    return res.status(401).end()
  }

  req.user = { id: user.id, email: user.email }
  next()
}
