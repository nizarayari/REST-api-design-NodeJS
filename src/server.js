import express from 'express'
import config from './config'
import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'

import { signup, signin, protect } from './utils/auth'
import userRouter from './resources/user/router'

export const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

app.post('/signup', signup)
app.post('/signin', signin)

app.use('/api', protect)
app.use('/api/user', userRouter)

export const start = () => {
  try {
    app.listen(config.port, () => {
      console.log(`REST API on http://localhost:${config.port}`)
    })
  } catch (e) {
    console.error(e)
  }
}
