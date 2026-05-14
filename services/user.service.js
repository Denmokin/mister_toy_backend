
import { utilService } from "./util.service.js"

const USERS_PATH = 'data/users.json'
let users = []

export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  add
}

utilService.readJsonFile(USERS_PATH)
  .then(data => {
    users = data
  })

  

function query() {
  const usersToReturn = users.map(user => ({ id: user.id, fullname: user.fullname, }))
  console.log('usersToReturn: ', usersToReturn)
  return Promise.resolve(usersToReturn)
}

function getById(userId) {
  const user = users.find(currUser => currUser.id === userId)
  if (!user) return Promise.reject(new Error('Cant Find user with id: ' + userId))
  return Promise.resolve(user)
}

function getByUsername(userName) {
  const user = users.find(currUser => currUser.username === userName)
  return Promise.resolve(user)
}

function remove(userId) {
  users = users.filter(currUser => currUser.id !== userId)
  return _saveUsersToFile()
}

function add(user) {
  return getByUsername(user.username)
    .then(existingUser => {
      if (existingUser) return Promise.reject(new Error('Username taken'))

      user.id = utilService.makeId('user')
      users.push(user)

      return _saveUsersToFile()
        .then(() => {
          user = { ...user }
          delete user.password
          return user
        })
    })
}

function _saveUsersToFile() {
  return utilService.writeJsonFile(USERS_PATH, users)
}