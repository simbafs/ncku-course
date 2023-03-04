import express from 'express'
import { User, Course, Image } from '../db/models'

const router = express.Router()

router.get('/course', async (req, res, next) => {
	// TODO remove `as`
	let courseNumber = req.query.courseNumber as string
	let classCode = req.query.classCode as string

	let query: {
		courseNumber?: string
		classCode?: string
	} = {}

	if (typeof courseNumber !== 'undefined') query.courseNumber = courseNumber
	if (typeof classCode !== 'undefined') query.classCode = classCode

	let courses = await Course.findAll({
		where: query,
	})
	res.locals.data = courses.map(course => course.id)
	next()
})

router.get('/course/:id', async (req, res, next) => {
	let id = req.params.id
	let course = await Course.findByPk(id, { include: ['histogram'] })
	let filepath = course?.histogram.path
	if (filepath) return res.sendFile(filepath)
	else {
		res.locals.error = 'course histogram not found'
		return next()
	}
})

router.get('/all', async (req, res, next) => {
	let user = await User.findAll()
	let course = await Course.findAll()
	let image = await Image.findAll()
	res.locals.data = { user, course, image }
	return next()
})

router.use((req, res) => {
	if (res.locals.err)
		return res.status(400).json({
			error: true,
			message: res.locals.err,
		})

	if (res.locals.data) return res.json(res.locals.data)

	return res.json({
		params: req.params,
		query: req.query,
		body: req.body,
	})
})

export default router
