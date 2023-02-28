import {
	Sequelize,
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
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
} from 'sequelize'

function generateToken(len = 6) {
	let char = '0123456789'.split('')
	let token = ''
	for (let i = 0; i < len; i++) {
		token += char[Math.floor(Math.random() * char.length)]
	}
	return token
}

const sequelize = new Sequelize('sqlite:///home/simba/git/ncku-course/database.sqlite')
export default sequelize

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	declare id: string
	declare name: string
	declare department: string
	declare validated: boolean
	declare validationToken: string
	declare contribution: number
	validateToken(token: string) {
		if (token === this.validationToken) this.validated = true
	}
}
User.init(
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		name: DataTypes.STRING,
		department: DataTypes.STRING,
		validated: DataTypes.BOOLEAN,
		validationToken: {
			type: DataTypes.STRING,
			defaultValue: () => generateToken(6),
		},
		contribution: DataTypes.DECIMAL,
	},
	{ sequelize }
)

export class Image extends Model<InferAttributes<Image>, InferCreationAttributes<Image>> {
	declare path: string
	declare md5: string
}
Image.init(
	{
		path: DataTypes.STRING,
		md5: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
	},
	{ sequelize }
)

export class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
	declare number: string
	declare classCode: string

	declare images: NonAttribute<Image[]>
	// these will not exist until `Model.init` was called.
	declare getImages: HasManyGetAssociationsMixin<Image> // Note the null assertions!
	declare addImage: HasManyAddAssociationMixin<Image, string>
	declare addImages: HasManyAddAssociationsMixin<Image, string>
	declare setImages: HasManySetAssociationsMixin<Image, string>
	declare removeImage: HasManyRemoveAssociationMixin<Image, string>
	declare removeImages: HasManyRemoveAssociationsMixin<Image, string>
	declare hasImage: HasManyHasAssociationMixin<Image, string>
	declare hasImages: HasManyHasAssociationsMixin<Image, string>
	declare countImages: HasManyCountAssociationsMixin
	declare createImage: HasManyCreateAssociationMixin<Image, 'md5'>
}
Course.init(
	{
		number: DataTypes.STRING,
		classCode: DataTypes.STRING,
	},
	{ sequelize }
)
Course.hasMany(Image)
