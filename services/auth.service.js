import Cryptr from 'cryptr'
import { userService } from './user.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'tenacious-d')

export const authService = {
    checkLogin,
    getLoginToken,
    validateToken,
}

function checkLogin({ username, password }) {

    return userService.getByUsername(username)
        .then(user => {
            if (user && user.password === password) {
                user = { ...user }
                delete user.password
                return Promise.resolve(user)
            }
            return Promise.reject()
        })
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    if (!token) return null
    const decryptedToken = cryptr.decrypt(token)
    const user = JSON.parse(decryptedToken)
    return user
}

export function requireUser(req, res, next) {
    const loggedInUser = authService.validateToken(req.cookies.loginToken)

    if (!loggedInUser) {
        return res.status(401).send('Unauthenticated...')
    }
    req.loggedInUser = loggedInUser
    next()
}