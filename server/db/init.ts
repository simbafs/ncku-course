import {
	Sequelize,
	Model,
	InferAttributes,
	InferCreationAttributes,
	DataTypes,
	NonAttribute,
	HasManyGetAssociationsMixin,
	HasManyAddAssociationMixin,
	HasManyAddAssociationsMixin,
	HasManySetAssociationsMixin,
	HasManyRemoveAssociationMixin,
	HasManyRemoveAssociationsMixin,
	HasManyHasAssociationMixin,
	HasManyHasAssociationsMixin,
	HasManyCountAssociationsMixin,
	HasManyCreateAssociationMixin,
	HasOneGetAssociationMixin,
	HasOneSetAssociationMixin,
	HasOneCreateAssociationMixin,
} from 'sequelize'

export class Image extends Model<InferAttributes<Image>, InferCreationAttributes<Image>> {
	declare path: string
	declare md5: string
}

export class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
	declare number: string
	declare classCode: string
	declare year: number
	declare semester: number
	// declare histogram: string
	declare teacher: string

	declare images: NonAttribute<Image[]>
	// these will not exist until `Model.init` was called.
	declare getImage: HasOneGetAssociationMixin<Image> // Note the null assertions!
	declare setImage: HasOneSetAssociationMixin<Image, string>
	declare createImage: HasOneCreateAssociationMixin<Image>
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	declare id: string
	declare name: string
	declare verified: boolean
	declare email: string
	// declare contributions: string[]

	declare contributions: NonAttribute<Image[]>
	// these will not exist until `Model.init` was called.
	declare getContributions: HasManyGetAssociationsMixin<Course> // Note the null assertions!
	declare addContribution: HasManyAddAssociationMixin<Course, string>
	declare addContributions: HasManyAddAssociationsMixin<Course, string>
	declare setContributions: HasManySetAssociationsMixin<Course, string>
	declare removeContribution: HasManyRemoveAssociationMixin<Course, string>
	declare removeContributions: HasManyRemoveAssociationsMixin<Course, string>
	declare hasContribution: HasManyHasAssociationMixin<Course, string>
	declare hasContributions: HasManyHasAssociationsMixin<Course, string>
	declare countContributions: HasManyCountAssociationsMixin
	declare createContribution: HasManyCreateAssociationMixin<Course, 'number'>
}

export default function initDB(sequelize: Sequelize) {
	Image.init(
		{
			md5: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			path: DataTypes.STRING,
		},
		{ sequelize }
	)

	Course.init(
		{
			number: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			classCode: DataTypes.STRING,
			year: DataTypes.INTEGER,
			semester: DataTypes.INTEGER,
			// histogram: {
			// 	type: DataTypes.STRING,
			// 	references: {
			// 		model: Image,
			// 		key: 'id',
			// 	},
			// },
			teacher: DataTypes.STRING,
		},
		{ sequelize }
	)
	Course.hasOne(Image)

	User.init(
		{
			id: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			name: DataTypes.STRING,
			verified: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			email: DataTypes.STRING,
			// contributions: {
			// 	type: DataTypes.ARRAY(DataTypes.STRING),
			// 	references: {
			// 		model: Course,
			// 		key: 'number',
			// 	},
			// },
		},
		{ sequelize }
	)
	User.hasMany(Course, {
		as: 'contribution',
	})

	return {
		User,
		Course,
		Image,
	}
}

// ;(async () => {
// 	const sequelize = new Sequelize('sqlite:/home/simba/git/ncku-course/server/db/database.sqlite')
// 	const { User, Course, Image } = initDB(sequelize)
//
// 	// await sequelize.sync({ force: true })
//
// 	// let h = await Image.create({
// 	// 	md5: '324234234243',
// 	// 	path: '/image/english',
// 	// })
// 	//
// 	// let english = await Course.create({
// 	// 	number: 'A1234',
// 	// 	classCode: '',
// 	// 	year: 2022,
// 	// 	semester: 2,
// 	// 	teacher: JSON.stringify(['some body']),
// 	// })
// 	//
// 	// let simba = await User.create({
// 	// 	id: 'C24206082',
// 	// 	name: 'simba',
// 	// 	verified: true,
// 	// 	email: 'c24106082@gs.ncku.edu.tw',
// 	// })
//
// 	// await english.setImage(h)
// 	//
// 	// await simba.addContribution(english)
//
// 	Course.findOne({ include: [Image] }).then(data => console.log(JSON.stringify(data?.dataValues, null, 2)))
// })()
