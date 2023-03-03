import {
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
import { ContribInfo } from '../../routes'
import Image from './image'
import Course from './course'

export default class User extends Model<
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

	static async updateUser(userInfo: Pick<ContribInfo, 'schoolID' | 'name' | 'semester'>, contribution: number) {
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
}
