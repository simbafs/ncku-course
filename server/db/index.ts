import path from 'path'
import { Sequelize } from 'sequelize'
import initModels from './init'

let dbpath = process.env.DB ? path.join(process.cwd(), process.env.DB) : ':memory:'
let sequelize: Sequelize

export default async function initDB() {
	try {
		sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: dbpath,
			logging: false,
		})
		initModels(sequelize)
		await sequelize.sync()
	} catch (e) {
		throw e
	}
	console.log('connected to database', dbpath)
}

export function getDB() {
	return sequelize
}
