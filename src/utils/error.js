export class UserError extends Error {
  constructor(...params) {
    super(...params)
    this.name = 'User Error'
    this.message = 'User already exists'
  }
}
