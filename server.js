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

// Fallback Path Resolve
app.get('{*splat}', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

app.get('/api/toy', (req, res) => {
    const queryOptions = _parseQueryParams(req.query)
    toyService.query(queryOptions)
        .then(toys => res.send(toys))
        .catch(err => {
            console.log('Had issues getting toys: ', err)
            res.status(400).send({ msg: 'Had issues getting toys' })
        })
})


app.get('/api/toy/:id', (req, res) => {
    const { id } = req.params

    toyService.getById(id)
        .then(toy => res.send(toy))
        .catch(err => {
            console.log(`Had issues getting toy:${id}`, err)
            res.status(400).send({ msg: `Had issues getting toy:${id}` })
        })
})

app.delete('/api/toy/:id', requireUser, (req, res) => {
    const { id } = req.params

    toyService.remove(id)
        .then(toy => res.send(toy))
        .catch(err => {
            console.log(`Had issues getting toy:${id}`, err)
            res.status(400).send({ msg: `Had issues getting toy:${id}` })
        })
})

app.put('/api/toy/:id', requireUser, (req, res) => {
    const toy = req.body
    toyService.save(toy)
        .then(toyToUpdate => res.send(toyToUpdate))
        .catch(err => {
            console.log(`Had issues adding toy`, err)
            res.status(400).send({ msg: 'Had issues adding toy' })
        })
})

app.post('/api/toy/', requireUser, (req, res) => {
    const toy = req.body
    toyService.save(toy)
        .then(toyToSave => res.send(toyToSave))
        .catch(err => {
            console.log(`Had issues updating toy`, err)
            res.status(400).send({ msg: 'Had issues updating toy' })
        })
})

// AUTH Rest API

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.add(credentials)
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            }
            else {
                res.status(400)
                send('Cannot Signup')
            }
        })
        .catch(err => res.status(400).send('Username Taken.', err))
})


app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => res.status(404).send('Invalid Credentials.'))
})

app.post('/api/auth.logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged Out!')
})


// USER rest API

app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            res.status(400).send('Cannot load users', err)
        })
})

app.get('/api/user/:id', (req, res) => {
    const { id } = req.params

    userService.getById(id)
        .then(user => res.send(user))
        .catch(err => {
            res.status(400).send('Cannot get user', id, err)
        })
})




function _parseQueryParams(queryParams) {
    const filterBy = {
        txt: queryParams.txt || '',
        maxPrice: queryParams.maxPrice || Infinity,
        labels: queryParams.labels || [],
        inStock: queryParams.inStock || '',
    }

    // const sortBy = {
    //     sortField: queryParams.sortField || '',
    //     sortDir: +queryParams.sortDir || 1,
    // }

    // const pagination = {
    //     pageIdx: queryParams.pageIdx !== undefined ? +queryParams.pageIdx || 0 : queryParams.pageIdx,
    //     pageSize: +queryParams.pageSize || 3,
    // }

    return { filterBy }
}

const port = 3030
app.listen(port, () => {
    console.log('Server is up and listening to', port)
})