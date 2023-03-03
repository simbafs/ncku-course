import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	NonAttribute,
	HasOneGetAssociationMixin,
	HasOneSetAssociationMixin,
	HasOneCreateAssociationMixin,
} from 'sequelize'
import Image from './image'

export default class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
	declare id: string
	declare courseNumber: string
	declare classCode: string
	declare semester: number
	declare teacher: string // this not support yet, need crawler to get courses data

	declare histogram: NonAttribute<Image[]>
	// these will not exist until `Model.init` was called.
	declare getHistogram: HasOneGetAssociationMixin<Image> // Note the null assertions!
	declare setHistogram: HasOneSetAssociationMixin<Image, string>
	declare createHistogram: HasOneCreateAssociationMixin<Image>

	static createCourseWithImage(info: Pick<Course, 'courseNumber' | 'classCode' | 'semester'>) {
		return async (image: Image) => {
			let course = Course.build({
				id: [info.semester, info.courseNumber, info.classCode].join('-'),
				courseNumber: info.courseNumber,
				classCode: info.classCode,
				semester: info.semester,
				teacher: '',
			})
			course.setHistogram(image)
			return course.save()
		}
	}
}
