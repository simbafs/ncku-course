import express from 'express'
import { User, Course, Image } from '../db/models'

const router = express.Router()

router.get('/course', async (req, res) => {
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
	return res.data(courses.map(course => course.id))
})

router.get('/course/:id', async (req, res) => {
	let id = req.params.id
	let course = await Course.findByPk(id, { include: ['histogram'] })
	let filepath = course?.histogram.path
	if (filepath) return res.sendFile(filepath)
	else return res.error('course histogram not found')
})

router.get('/all', async (req, res) => {
	let user = await User.findAll()
	let course = await Course.findAll()
	let image = await Image.findAll()
	return res.data({ user, course, image })
})

export default router
