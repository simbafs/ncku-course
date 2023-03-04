import express from 'express'
import { User } from '../db/models'

const router = express.Router()

function generateToken(len = 6) {
	let char = '0123456789'.split('')
	let token = ''
	for (let i = 0; i < len; i++) {
		token += char[Math.floor(Math.random() * char.length)]
	}
	return token
}

const timeout = 10 * 60 * 1000
const tokenMap = new Map<
	string,
	{
		deadline: number
		token: string
	}
>()

router.post('/login', async (req, res) => {
	let schoolID: string = req.body.schoolID
	let resend: boolean = req.body.resend

	if (!schoolID.match(/^[a-zA-Z][0-9]{8}$/)) return res.error('學號格式錯誤')

	let user = await User.findByPk(schoolID)

	if (!user) return res.data('需要建立帳號')

	if (tokenMap.has(schoolID) && !resend) return res.data('請收信')

	const token = generateToken(6)
	tokenMap.set(schoolID, {
		deadline: Date.now() + timeout,
		token: token,
	})
	console.log({ schoolID, token })

	return res.data('去收信')
})

router.get('/login/:schoolID/:token', (req, res) => {
	const token = req.params.token
	const schoolID = req.params.schoolID
	const savedToken = tokenMap.get(schoolID)

	if (!savedToken) return res.error('login failed')

	if (savedToken.token !== token) return res.error('token not match')

	if (savedToken.deadline < Date.now()) return res.error('timeout')

	// TODO: set jwt here
	return res.data('jwt')
})

export default router
