
import { readJsonFile, writeJsonFile, makeId } from "./util.service.js"

const USERS_PATH = 'data/users.json'
let users = await readJsonFile(USERS_PATH)

export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  add
}


async function query() {
  try {
    const usersToReturn = users.map(user => ({ _id: user._id, fullname: user.fullname, }))
    return usersToReturn
  }
  catch (err) { 
    console.error('userService.query failed:', err)
    throw err
  }
}

async function getById(userId) {
  try {
    const user = users.find(currUser => currUser.id === userId)
    if (!user) throw new Error(`Can't find user with id ${userId}`)
    return user
  }
  catch (err) {
    console.error('userService.getById failed:', err)
    throw err
  }
}

async function getByUsername(userName) {
  try {
    const user = users.find(
      currUser => currUser.username.toLowerCase() === userName.toLowerCase()
    )
    return user || null
  }
  catch (err) {
    console.error('userService.getByUsername failed:', err)
    throw err
  }
}

async function remove(userId) {
  try {
    users = users.filter(currUser => currUser.id !== userId)
    await _saveUsersToFile()
  }
  catch (err) {
    console.error('userService.remove failed:', err)
    throw err
  }
}

async function add(user) {

  try {
    const existingUser = await getByUsername(user.username)
    if (existingUser) throw new Error('Username taken')

    user._id = makeId('user')
    users.push(user)
    await _saveUsersToFile()

    const safeUser = { ...user }
    delete safeUser.password
    return safeUser
  }

  catch (err) {
    console.error('userService.add failed:', err)
    throw err
  }
}

async function _saveUsersToFile() {
  return await writeJsonFile(USERS_PATH, users)
}