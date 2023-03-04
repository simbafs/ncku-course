import { Sequelize, DataTypes } from 'sequelize'
import { User, Course, Image } from './models'
export { User, Course, Image }

export default function initModels(sequelize: Sequelize) {
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
			latestContrib: DataTypes.INTEGER,
		},
		{ sequelize }
	)
	// Course <-> Image, one-to-one
	Course.hasOne(Image, { as: 'histogram' })
	Image.belongsTo(Course, { foreignKey: 'histogramId' })

	return {
		User,
		Course,
		Image,
	}
}
