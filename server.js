import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { toyService } from './services/toy.service.js'

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

app.get('/api/toy', (req, res) => {
    const queryOptions = parseQueryParams(req.params)
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
            console.log(`Had issues getting toy:${toyId}`, err)
            res.status(400).send({ msg: `Had issues getting toy:${toyId}` })
        })
})

app.delete('/api/toy/:id', (req, res) => {
    const { id } = req.params

    toyService.remove(id)
        .then(toy => res.send(toy))
        .catch(err => {
            console.log(`Had issues getting toy:${toyId}`, err)
            res.status(400).send({ msg: `Had issues getting toy:${toyId}` })
        })
})

app.put('/api/toy/:id', (req, res) => {
    const toy = req.body
    toyService.save(toy)
        .then(toyToUpdate => res.send(toyToUpdate))
        .catch(err => {
            console.log(`Had issues adding toy`, err)
            res.status(400).send({ msg: 'Had issues adding toy' })
        })
})

app.post('/api/toy/', (req, res) => {
    const toy = req.body
    toyService.save(toy)
        .then(toyToSave => res.send(toyToSave))
        .catch(err => {
            console.log(`Had issues updating toy`, err)
            res.status(400).send({ msg: 'Had issues updating toy' })
        })
})

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => {
    console.log('Server is up and listening to', port)
})

function parseQueryParams(queryParams) {
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