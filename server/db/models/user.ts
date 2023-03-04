import {
	Model,
	InferAttributes,
	InferCreationAttributes,
} from 'sequelize'
import { ContribInfo } from '../../routes'

export default class User extends Model<
	InferAttributes<User>,
	InferCreationAttributes<User, { omit: 'role' | 'validContrib' }>
> {
	declare schoolID: string
	declare name: string
	declare email: string
	declare role: 'guest' | 'user' | 'admin'
	declare validContrib: number
	declare latestContrib: number

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
