import express from 'express'
import fileUpload from 'express-fileupload'
import exifr from 'exifr'
import { User, Course, Image } from '../db/init'
import path from 'path'

const router = express.Router()

async function saveFile(file: fileUpload.UploadedFile, name: string) {
	let filepath = path.join(process.cwd(), 'image', name)
	return file.mv(filepath).then(() =>
		Image.create({
			path: filepath,
			md5: file.md5,
		})
	)
}

type CourseInfo = Pick<Course, 'courseNumber' | 'classCode' | 'semester'>
function createCourse(courseInfo: CourseInfo) {
	return async (image: Image) => {
		let course = Course.buildFromInfo(courseInfo)
		course.setHistogram(image)
		return course.save()
	}
}

type UserInfo = Pick<ContribInfo, 'schoolID' | 'name' | 'semester'>
async function updateUser(userInfo: UserInfo, contribution: number) {
	let user = await User.findOne({
		where: {
			schoolID: userInfo.schoolID,
		},
	})
	if (!user) {
		user = User.build({
			schoolID: userInfo.schoolID,
			name: userInfo.name,
			email: `${userInfo.schoolID}@gs.nkcu.edu.tw`,
			latestContrib: userInfo.semester,
		})
	}

	user.validContrib += contribution
	if (user.latestContrib < userInfo.semester) user.latestContrib = userInfo.semester

	return user.save()
}

async function isImageValid(image: fileUpload.UploadedFile) {
	const invalidImage = '850a0b27b18e17ee7101a5184c59f8cb'
	const validImageMeta =
		'{"ImageWidth":460,"ImageHeight":300,"BitDepth":2,"ColorType":"Palette","Compression":"Deflate/Inflate","Filter":"Adaptive","Interlace":"Noninterlaced"}'

	// exclude image that data not found
	if (image.md5 === invalidImage) {
		console.log('not found image')
		return false
	}

	// Exclude images that may not match metadata
	if (JSON.stringify(await exifr.parse(image.data)) !== validImageMeta) {
		console.log('metadata not match')
		return false
	}

	// check if image exist
	if ((await Image.count({ where: { md5: image.md5 } })) > 0) {
		console.log('dulplicated')
		return false
	}

	return true
}

type ContribInfo = {
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

	console.log(contribInfo)

	let validContrib = 0
	for await (let file of files) {
		const image = req.files[file] as fileUpload.UploadedFile

		if (!(await isImageValid(image))) continue
		let [courseNumber, classCode] = file.split('-')

		console.log({
			courseNumber,
			classCode,
			semester: contribInfo.semester,
		})

		await saveFile(image, `${contribInfo.semester}-${courseNumber}-${classCode}.png`).then(
			createCourse({
				courseNumber,
				classCode,
				semester: contribInfo.semester,
			})
		)
		validContrib++
	}
	let invalidContrib = files.length - validContrib

	console.log(
		{
			schoolID: contribInfo.schoolID,
		},
		contribInfo
	)

	await updateUser(contribInfo, validContrib)

	res.json({ error: false, validContrib, invalidContrib })
})

router.get('/all', async (req, res) => {
	let user = await User.findAll()
	let course = await Course.findAll()
	let image = await Image.findAll()
	return res.json({ user, course, image })
})

router.get('/', async function (req, res) {
	return res.status(200).send('hi')
})

export default router
