import Cryptr from 'cryptr'
import { userService } from './user.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'tenacious-d')

export const authService = {
    checkLogin,
    getLoginToken,
    validateToken,
}

async function checkLogin({ username, password }) {
    try {
        let user = await userService.getByUsername(username)
        if (user && user.password === password) {
            user = { ...user }
            delete user.password
            return user
        }
        throw new Error(`Username or password are wrong`)
    }
    catch (err) {
        console.error('authService.checkLogin failed:', err)
        throw err
    }
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
    req.verifiedUser = loggedInUser
    next()
}