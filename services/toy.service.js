import { utilService } from "./util.service.js"
import { userService } from "./user.service.js"
import { authService } from "./auth.service.js"

const TOYS_PATH = 'data/toys.json'
const USERS_PATH = 'data/users.json'

export const toyService = {
    query,
    getById,
    remove,
    save,
}

let toys = []

async function query({ filterBy = {}, sortBy = {} }) {
    try {
        toys = await _generateToys(15)

        let filteredToys = [...toys]

        if (filterBy.txt) {
            const regExp = new RegExp(filterBy.txt, 'i')
            filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
        }

        if (filterBy.inStock !== undefined && filterBy.inStock !== '') {
            filteredToys = filteredToys.filter(toy => toy.inStock === true)
        }

        if (filterBy.labels && filterBy.labels.length && !filterBy.labels.includes('')) {
            filteredToys = filteredToys.filter(toy =>
                filterBy.labels.some(label => toy.labels.includes(label))
            )
        }

        if (!filterBy.maxPrice) filterBy.maxPrice = Infinity
        filteredToys = filteredToys.filter(toy => toy.price <= filterBy.maxPrice)

        return filteredToys
    } catch (err) {
        console.error('toyService.query failed:', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const toy = toys.find(toy => toy._id === toyId)
        if (!toy) throw new Error(`Toy ${toyId} not found`)
        return toy
    } catch (err) {
        console.error('toyService.getById failed:', err)
        throw err
    }
}

async function remove(toyId, loggedInUser) {
    try {
        const idx = toys.findIndex(toy => toy._id === toyId)
        if (idx === -1) throw new Error('Toy not found')

        const isCreator = toys[idx].creator._id === loggedInUser._id
        if (!isCreator && !loggedInUser.isAdmin) throw new Error('Unauthenticated user')

        toys.splice(idx, 1)
        await _saveToysToFile()
    } catch (err) {
        console.error('toyService.remove failed:', err)
        throw err
    }
}

async function save(toyToSave, loggedInUser) {
    try {
        if (toyToSave._id) {
            const idx = toys.findIndex(currToy => currToy._id === toyToSave._id)
            if (idx === -1) throw new Error('Toy not found')

            const isCreator = toys[idx].creator._id === loggedInUser._id
            if (!isCreator && !loggedInUser.isAdmin) throw new Error('Unauthenticated user')

            const toyToUpdate = toys[idx]
            toys[idx] = { ...toyToUpdate, ...toyToSave }
            toyToSave = toys[idx]

        } else {
            const { _id, fullname } = loggedInUser
            toyToSave._id = utilService.makeId('toy')
            toyToSave.createdAt = utilService.getRandomDate()
            toyToSave.creator = { _id, fullname }
            toys.push(toyToSave)
        }

        await _saveToysToFile()
        return toyToSave
    } catch (err) {
        console.error('toyService.save failed:', err)
        throw err
    }
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
    return { txt: '', labels: [], inStock: '', maxPrice: '' }
}

async function _saveToysToFile() {
    return await utilService.writeJsonFile(TOYS_PATH, toys)
}

async function _generateToys(count = 10) {
    let loadedToys = await utilService.readJsonFile(TOYS_PATH)
    if (loadedToys && loadedToys.length > 0) return loadedToys

    else {
        const allUsers = await utilService.readJsonFile(USERS_PATH)
        const nonAdminUsers = allUsers.filter(user => !user.isAdmin)

        loadedToys = Array.from({ length: count }, (_, i) => _generateToy(i, nonAdminUsers))
        await utilService.writeJsonFile(TOYS_PATH, loadedToys)
        return loadedToys
    }
}



function _generateToy(idx, users) {  // ✅ receives users as param
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
    const creator = _getRandomUser(users)  // ✅ pass users in

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

function _getRandomUser(users) {
    const idx = utilService.getRandomIntInclusive(0, users.length - 1)
    const { _id, username } = users[idx]
    return { _id, username }
}