import { Router } from 'express'
import { me } from './controller'

const router = Router()

router.get('/', me)

export default router
