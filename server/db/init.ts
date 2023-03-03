import { Sequelize, DataTypes } from 'sequelize'
import { User, Course, Image } from './models'
export { User, Course, Image }

function generateToken(len = 6) {
	let char = '0123456789'.split('')
	let token = ''
	for (let i = 0; i < len; i++) {
		token += char[Math.floor(Math.random() * char.length)]
	}
	return token
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
