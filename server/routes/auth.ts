import express from 'express'

const router = express.Router()

function generateToken(len = 6) {
	let char = '0123456789'.split('')
	let token = ''
	for (let i = 0; i < len; i++) {
		token += char[Math.floor(Math.random() * char.length)]
	}
	return token
}

router.get('/login', (req, res) => {
	
})

export default router
