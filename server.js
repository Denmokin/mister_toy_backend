import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { toyService } from './services/toy.service.js'
import { userService } from './services/user.service.js'
import { authService, requireUser } from './services/auth.service.js'

const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',

        'http://127.0.0.1:5174',
        'http://localhost:5174',
    ],
    credentials: true
}

app.use(cors(corsOptions))

// Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Support arrays in query params (req.query)
app.set('query parser', 'extended')


app.get('/api/toy', async (req, res) => {
    const queryOptions = _parseQueryParams(req.query)
    try {
        const toys = await toyService.query(queryOptions)
        res.send(toys)
    }
    catch (err) {
        console.log('Had issues getting toys: ', err)
        res.status(400).send({ msg: 'Had issues getting toys' })
    }
})


app.get('/api/toy/:id', async (req, res) => {
    const { id } = req.params
    try {
        const toy = await toyService.getById(id)
        res.send(toy)
    }
    catch (err) {
        console.log(`Had issues getting toy:${id}`, err)
        res.status(400).send({ msg: `Had issues getting toy:${id}` })
    }
})

app.delete('/api/toy/:id', requireUser, async (req, res) => {
    const { id } = req.params
    try {
        await toyService.remove(id)
        res.send({ msg: 'Toy removed', toyId: id })
    }
    catch (err) {
        console.log(`Had issues removing toy:${id}`, err)
        res.status(400).send({ msg: `Had issues removing toy:${id}` })
    }
})

app.put('/api/toy/:id', requireUser, async (req, res) => {
    const toy = req.body
    const loggedInUser = authService.validateToken(req.cookies.loginToken)
    try {
        const toyToUpdate = await toyService.save(toy, loggedInUser)
        res.send(toyToUpdate)
    }
    catch (err) {
        console.log(`Had issues updating toy`, err)
        res.status(400).send({ msg: 'Had issues updating toy' })
    }
})


app.post('/api/toy/', requireUser, async (req, res) => {
    const toy = req.body
    const loggedInUser = authService.validateToken(req.cookies.loginToken)
    try {
        const toyToSave = await toyService.save(toy, loggedInUser)
        res.send(toyToSave)
    }
    catch (err) {
        console.log(`Had issues adding toy`, err)
        res.status(400).send({ msg: 'Had issues adding toy' })
    }
})

// AUTH Rest API

app.post('/api/auth/signup', async (req, res) => {
    const credentials = req.body
    try {
        const user = await userService.add(credentials)
        if (user) {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        }
        else {
            res.status(400).send('Cannot Signup')
        }
    }
    catch (err) {
        console.log('Username Taken: ', err)
        res.status(400).send('Username Taken.')
    }
})


app.post('/api/auth/login', async (req, res) => {
    const credentials = req.body
    try {
        const user = await authService.checkLogin(credentials)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
    }
    catch (err) {
        console.log('Invalid Credentials: ', err)
        res.status(401).send('Invalid Credentials.')
    }
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged Out!')
})

// USER rest API

app.get('/api/user', async (req, res) => {
    try {
        const users = await userService.query()
        res.send(users)
    }
    catch (err) {
        console.log('Cannot load users: ', err)
        res.status(400).send('Cannot load users')
    }
})

app.get('/api/user/:id', async (req, res) => {
    const { id } = req.params
    try {
        const user = await userService.getById(id)
        res.send(user)
    }
    catch (err) {
        console.log('Cannot get user: ', id, err)
        res.status(400).send(`Cannot get user:${id}`)
    }
})


function _parseQueryParams(queryParams) {
    const filterBy = {
        txt: queryParams.txt || '',
        maxPrice: queryParams.maxPrice || Infinity,
        labels: queryParams.labels || [],
        inStock: queryParams.inStock || '',
    }
    return { filterBy }
}

// Fallback Path Resolve
app.get('{*splat}', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => {
    console.log('Server is up and listening to', port)
})