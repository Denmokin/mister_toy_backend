import { utilService } from "./util.service.js"

const TOYS_PATH = 'data/toys.json'
const USERS_PATH = 'data/user.json'

export const toyService = {
    query,
    getById,
    remove,
    save,
}

let toys = []


function query({ filterBy = {}, sortBy = {} }) {

    toys = _generateToys(15)

    let filteredToys = [...toys]

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.inStock !== undefined && filterBy.inStock !== '') {
        filteredToys = filteredToys.filter(toy => toy.inStock === true)
    }

    if (!filterBy.maxPrice) filterBy.maxPrice = Infinity
    filteredToys = filteredToys.filter(toy => toy.price <= filterBy.maxPrice)

    return Promise.resolve(filteredToys)
}


function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('Toy not found')

    toys.splice(idx, 1)

    _saveToysToFile()
    return Promise.resolve(toys)
}


function save(toyToSave) {
    if (toyToSave._id) {
        const idx = toys.findIndex(currToy => currToy._id === toyToSave._id)
        if (idx === -1) return Promise.reject('Toy not found') // Added missing 'return'

        const toyToUpdate = toys[idx]
        toys[idx] = { ...toyToUpdate, ...toyToSave }
        toyToSave = toys[idx]
    } else {
        toyToSave._id = utilService.makeId('toy')
        toyToSave.createdAt = utilService.getRandomDate()
        toys.push(toyToSave)
    }

    _saveToysToFile()
    return Promise.resolve(toyToSave)
}

function _getEmptyToy() {
    return {
        name: '',
        imgUrl: '',
        price: '',
        labels: [],
        createdAt: '',
        inStock: '',
    }
}

function _getDefaultFilters() {
    return { txt: '', labels: [], inStock: '', maxPrice: '', }
}

function _saveToysToFile() {
    return utilService.writeJsonFile(TOYS_PATH, toys)
}


// Toy Generation 


function _generateToys(count = 10) {
    let loadedToys = utilService.readJsonFile(TOYS_PATH)
    if (loadedToys && loadedToys.length > 0) return loadedToys

    loadedToys = Array.from({ length: count }, (_, i) => _generateToy(i))
    utilService.writeJsonFile(TOYS_PATH, loadedToys)

    return loadedToys
}

function _generateToy(idx) {


    const toyNames = [
        'Talking Doll', 'Remote Control Car', 'Building Blocks Set',
        'Stuffed Teddy Bear', 'Wooden Train Set', 'Bubble Machine',
        'Dinosaur Figurine', 'Magnetic Drawing Board', 'Foam Dart Blaster',
        'Puzzle Box', 'Mini Basketball Hoop', 'Glow in the Dark Stars',
        'Play Kitchen Set', 'Action Hero Figure', 'Musical Xylophone',
    ]

    const allToyLabels = [
        'Doll', 'Battery Powered', 'Baby', 'Outdoor', 'Educational',
        'Wooden', 'Electronic', 'Puzzle', 'Action Figure', 'Creative',
        'Musical', 'STEM', 'Pretend Play', 'Ages 3+', 'Ages 6+', 'Ages 10+',
    ]

    const name = toyNames[idx % toyNames.length]
    const labelCount = Math.floor(Math.random() * 3) + 1

    const creator = _getRandomUser()

    return {
        _id: utilService.makeId('toy'),
        name,
        imgUrl: `https://robohash.org/${encodeURIComponent(name)}?set=set4&size=200x200`,
        price: utilService.getRandomIntInclusive(10, 150),
        labels: utilService.getRandomFromArr(allToyLabels, labelCount),
        createdAt: utilService.getRandomDate(),
        inStock: Math.random() > 0.6,
        creator,
    }
}

function _getRandomUser() {
    let users = utilService.readJsonFile(USERS_PATH)
    users = users.filter(user => user.isAdmin !== true)
    randIdx = utilService.getRandomIntInclusive(0, users.length)
    const { _id, fullname } = users[idx]
    return { _id, fullname }
}