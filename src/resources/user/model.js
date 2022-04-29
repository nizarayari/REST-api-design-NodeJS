import bcrypt from 'bcrypt'

export class UserModel {
  constructor() {
    this.users = []
    this.id = 0
  }

  create(user) {
    const createdUser = {
      id: this.id++,
      ...user
    }
    this.users.push(createdUser)
    return createdUser
  }

  findById(id) {
    return this.users.find(user => user.id === id)
  }

  checkPassword(id, password) {
    const user = this.findById(id)
    if (!user) {
      return new Promise((resolve, reject) => resolve(false))
    }
    return bcrypt.compare(password, user.password)
  } // hint: make use of bcrypt to match password i.e: bcrypt.compare

  hashPassword(password) {
    const saltRound = 10
    return bcrypt.hash(password, saltRound)
  } // hint: make use of bcrypt to hash password i.e: bcrypt.hash
}
