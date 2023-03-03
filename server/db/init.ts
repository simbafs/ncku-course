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

function generateToken(len = 6) {
	let char = '0123456789'.split('')
	let token = ''
	for (let i = 0; i < len; i++) {
		token += char[Math.floor(Math.random() * char.length)]
	}
	return token
}

export class Image extends Model<InferAttributes<Image>, InferCreationAttributes<Image>> {
	declare path: string
	declare md5: string
}

export class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
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

	static buildFromInfo(info: Pick<Course, 'courseNumber' | 'classCode' | 'semester'>){
		return Course.build({
			id: [info.semester, info.courseNumber, info.classCode].join('-'),
			courseNumber: info.courseNumber,
			classCode: info.classCode,
			semester: info.semester,
			teacher: '', 
		})
	}
}

export class User extends Model<
	InferAttributes<User>,
	InferCreationAttributes<User, { omit: 'role' | 'validContrib' | 'validateToken' }>
> {
	declare schoolID: string
	declare name: string
	declare email: string
	declare role: 'guest' | 'user' | 'admin'
	declare validContrib: number
	declare validateToken: string
	declare latestContrib: number

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
	declare createContribution: HasManyCreateAssociationMixin<Course, 'courseNumber'>
}

export default function initColletions(sequelize: Sequelize) {
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

	// TODO: 操行、體育等可能重複的科目會出錯
	Course.init(
		{
			id: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			courseNumber: DataTypes.STRING,
			classCode: DataTypes.STRING,
			semester: DataTypes.INTEGER,
			teacher: DataTypes.STRING,
		},
		{ sequelize }
	)
	Course.hasOne(Image, {
		as: 'histogram',
	})

	User.init(
		{
			schoolID: {
				type: DataTypes.STRING,
				primaryKey: true,
				unique: true,
			},
			name: DataTypes.STRING,
			email: DataTypes.STRING,
			role: {
				type: DataTypes.STRING,
				defaultValue: 'guest',
			},
			validContrib: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
			},
			validateToken: {
				type: DataTypes.STRING,
				defaultValue: () => generateToken(6),
			},
			latestContrib: DataTypes.INTEGER,
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
