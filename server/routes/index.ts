import express from 'express'
import fileUpload from 'express-fileupload'
import exifr from 'exifr'
import { Course, Image } from '../db'

const router = express.Router()

const invalidImage = '850a0b27b18e17ee7101a5184c59f8cb'
const validImageMeta =
	'{"ImageWidth":460,"ImageHeight":300,"BitDepth":2,"ColorType":"Palette","Compression":"Deflate/Inflate","Filter":"Adaptive","Interlace":"Noninterlaced"}'

async function saveFile(file: fileUpload.UploadedFile, name: string) {
	// TODO check duplicated name but different content
	file.mv(`./image/${name}.png`)
}

router.post('/upload', async (req, res) => {
	if (!req.files) return res.json({ saved: 0 })
	const files = JSON.parse(req.body?.files || '[]')

	console.log(JSON.parse(req.body.info))

	let n = 0
	for await (let file of files) {
		const image = req.files[file] as fileUpload.UploadedFile
		// exclude image that data not found
		if (image.md5 === invalidImage) continue
		// Exclude images that may not match metadata
		if (JSON.stringify(await exifr.parse(image.data)) !== validImageMeta) continue

		saveFile(image, file)
		n++
	}

	// TODO: save userinfo and their comtribution

	res.json({ saved: n })
})

router.get('/', async function (req, res) {
	// Course.findAll({
	// 	include: [{ model: Image }],
	// }).then(courses => console.log(courses.map(item => item.dataValues)))

	let course = Course.build({ number: '12', classCode: '1212' })
	let image = Image.build({ path: './fasdf,png', md5: 'fjdsakfjds' })
	await course.setImages([image])
	await image.save()
	await course.save()

	res.status(200).send('hi')
})

export default router
