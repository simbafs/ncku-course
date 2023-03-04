import fileUpload from 'express-fileupload'
import exifr from 'exifr'
import path from 'path'
import { Model, InferAttributes, InferCreationAttributes } from 'sequelize'

export default class Image extends Model<InferAttributes<Image>, InferCreationAttributes<Image>> {
	declare path: string
	declare md5: string

	static async saveFile(file: fileUpload.UploadedFile, name: string) {
		let filepath = path.join(process.cwd(), 'image', name)
		return file.mv(filepath).then(() =>
			Image.create({
				path: filepath,
				md5: file.md5,
			})
		)
	}

	static async isValid(image: fileUpload.UploadedFile) {
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
}
