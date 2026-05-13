import fs from 'fs'
import fr from 'follow-redirects'
import _ from 'lodash'


const { http, https } = fr

export const utilService = {

	readJsonFile,
	writeJsonFile,
	download,
	httpGet,

	makeId,
	makeLorem,
	getRandomIntInclusive,
	loadFromStorage,
	saveToStorage,
	animateCSS,
	debounce,

	getRandomFromArr,
	getRandomDate,
}



function readJsonFile(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf8', (err, data) => {
			if (err) {
				return reject(err)
			}
			const json = JSON.parse(data)
			resolve(json)
		})
	})
}

function writeJsonFile(path, data) {
	return new Promise((resolve, reject) => {
		const jsonData = JSON.stringify(data, null, 2)
		fs.writeFile(path, jsonData, 'utf8', (err) => {
			if (err) {
				return reject(err)
			}
			resolve(jsonData)
		})
	})
}


function download(url, fileName) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(fileName)
		const protocol = url.startsWith('https') ? https : http

		protocol.get(url, content => {
			content.pipe(file)
			file.on('error', reject)
			file.on('finish', () => {
				file.close()
				resolve()
			})
		})
	})
}

function httpGet(url) {
	const protocol = url.startsWith('https') ? https : http
	const options = {
		method: 'GET',
	}

	return new Promise((resolve, reject) => {
		const req = protocol.request(url, options, res => {
			let data = ''
			res.on('data', chunk => {
				data += chunk
			})
			res.on('end', () => {
				resolve(data)
			})
		})
		req.on('error', err => {
			reject(err)
		})
		req.end()
	})
}


function makeId(prefix) {
	return _.uniqueId(prefix)
}

function makeLorem(size = 100) {
	var words = ['The sky', 'above', 'the port', 'was', 'the color of television', 'tuned', 'to', 'a dead channel', '.', 'All', 'this happened', 'more or less', '.', 'I', 'had', 'the story', 'bit by bit', 'from various people', 'and', 'as generally', 'happens', 'in such cases', 'each time', 'it', 'was', 'a different story', '.', 'It', 'was', 'a pleasure', 'to', 'burn']
	var txt = ''
	while (size > 0) {
		size--
		txt += words[Math.floor(Math.random() * words.length)] + ' '
	}
	return txt
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive 
}

function saveToStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value))
}

function loadFromStorage(key) {
	const data = localStorage.getItem(key)
	return (data) ? JSON.parse(data) : undefined
}

function animateCSS(el, animation) {
	const prefix = 'animate__'
	return new Promise((resolve, reject) => {
		const animationName = `${prefix}${animation}`

		el.classList.add(`${prefix}animated`, animationName)

		function handleAnimationEnd(event) {
			event.stopPropagation()
			el.classList.remove(`${prefix}animated`, animationName)
			resolve('Animation ended')
		}
		el.addEventListener('animationend', handleAnimationEnd, { once: true })
	})
}

function debounce(func, timeout = 300) {
	let timer
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, timeout)
	}
}

function getRandomFromArr(arr, count) {
	const shuffled = [...arr].sort(() => Math.random() - 0.5)
	return shuffled.slice(0, count)
}


function getRandomDate(start = new Date(2020, 0, 1), end = new Date()) {
	return Math.floor(new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).getTime())
}


export function toCap(string) {
	return _.capitalize(string)
}


fs.watchFile('data/toy.json', async (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
        try {
            // Fetch the freshly updated toys list
            const toys = await toyService.query()
            
            // Broadcast the entire updated array to all connected clients
            gIoServer.emit('toys-changed', toys)
        } catch (err) {
            console.error('Failed to broadcast file change:', err)
        }
    }
})