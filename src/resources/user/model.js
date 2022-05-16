import { nanoid } from 'nanoid'
import { UserError } from '../../utils/error'
import bcrypt from 'bcrypt'
class UserModel {
  constructor() {
    this.users = []
  }

  create(user) {
    const { email, password } = user

    const userAlreadyExists = this.findOne(email)

    if (userAlreadyExists) {
      throw new UserError()
    }

    const newUser = {
      email,
      password: this.hashPassword(password),
      id: nanoid(10)
    }

    this.users.push(newUser)
    return newUser
  }

  findOne(email) {
    return this.users.find(user => user.email === email)
  }

  findById(id) {
    return this.users.find(user => user.id === id)
  }

  checkPassword(id, password) {
    const user = this.findById(id)
    return bcrypt.compareSync(password, user.password)
  } // hint: make use of bcrypt to match password i.e: bcrypt.compare

  hashPassword(password) {
    return bcrypt.hashSync(password, 256)
  } // hint: make use of bcrypt to hash password i.e: bcrypt.hash
}

export const Users = new UserModel()
