import config from '../config'
import { UserModel } from '../resources/user/model'
import jwt from 'jsonwebtoken'

const userModel = new UserModel()

export const newToken = user => {
  return jwt.sign(user, config.secrets.jwt, {
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
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).send({ message: 'email and password required' })
    return
  }

  const hashedPassword = await userModel.hashPassword(req.body.password)
  const createdUser = userModel.create({
    email: req.body.email,
    password: hashedPassword
  })

  res.status(201).send({
    token: newToken(createdUser)
  })
}

export const signin = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).send({ message: 'email and password required' })
    return
  }

  const user = userModel.users.find(user => user.email === email)
  if (!user) {
    res.status(401).send({ message: 'email does not exist' })
    return
  }

  const matched = await userModel.checkPassword(user.id, password)
  if (matched) {
    res.status(201).send({ token: newToken(user) })
  } else {
    res.status(401).send({ message: 'incorrect password' })
  }
}

export const protect = async (req, res, next) => {
  const authorization = req.headers.authorization
  if (!authorization) {
    res
      .status(401)
      // .send({ message: 'authorization header required' })
      .end()
    return
  }
  const authParams = authorization.split(' ')
  if (authParams.length !== 2 || authParams[0] !== 'Bearer') {
    res
      .status(401)
      // .send({ message: 'invalid authorization header' })
      .end()
    return
  }

  const token = authParams[1]
  const signinUser = await verifyToken(token)
  const user = userModel.findById(signinUser.id)
  if (!user || signinUser.password !== user.password) {
    res
      .status(401)
      // .send({ message: 'invalid jwt' })
      .end()
  } else {
    req.user = { id: user.id, email: user.email }
    next()
  }
}
