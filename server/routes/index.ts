import express from 'express'
import fileUpload from 'express-fileupload'
import { User, Course, Image } from '../db/models'

const router = express.Router()

export type ContribInfo = {
	name: string
	department: string
	grade: number
	schoolID: string
	semester: number
}
// TODO: error handle
router.post('/upload', async (req, res) => {
	if (!req.files) return res.json({ saved: 0 })
	const files = JSON.parse(req.body?.files || '[]')

	let contribInfo: ContribInfo = JSON.parse(req.body.info)
	// TODO: check if all properties is valid

	// console.log(contribInfo)

	let validContrib = 0
	for await (let file of files) {
		const image = req.files[file] as fileUpload.UploadedFile

		if (!(await Image.isValid(image))) continue
		let [courseNumber, classCode] = file.split('-')

		// console.log({
		// 	courseNumber,
		// 	classCode,
		// 	semester: contribInfo.semester,
		// })

		await Image.saveFile(image, `${contribInfo.semester}-${courseNumber}-${classCode}.png`).then(
			Course.createCourseWithImage({
				courseNumber,
				classCode,
				semester: contribInfo.semester,
			})
		)
		validContrib++
	}
	let invalidContrib = files.length - validContrib

	await User.updateUser(contribInfo, validContrib)

	res.json({ error: false, validContrib, invalidContrib })
})

router.get('/', async function (req, res) {
	return res.status(200).send('hi')
})

export default router
