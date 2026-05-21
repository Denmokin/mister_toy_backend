import fs from 'fs/promises'
import fr from 'follow-redirects'
import _ from 'lodash'


const { http, https } = fr

export const utilService = {

	readJsonFile,
	writeJsonFile,
	readJsonFileSync,
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



export async function readJsonFile(path) {
	try {
		const data = await fs.readFile(path, 'utf8')
		if (!data || data.trim() === '') return []
		return JSON.parse(data)
	} catch (err) {
		console.error('Error reading or parsing file from', path, err)
		throw err
	}
}

export async function writeJsonFile(path, data) {
	const jsonData = JSON.stringify(data, null, 2)

	try {
		await fs.writeFile(path, jsonData, 'utf8')
		return true
	} catch (err) {
		console.error('Error writing file to', path, err)
		throw err
	}
}


function readJsonFileSync(path) {
	const data = fs.readFileSync(path, 'utf8')
	return JSON.parse(data)
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

export function makeId(prefix) {
	return `${prefix}${crypto.randomUUID()}`
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