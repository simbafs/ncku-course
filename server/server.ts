import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import path from 'path'
import cors from 'cors'
import fileUpload from 'express-fileupload'

import indexRouter from './routes/index'
import apiRouter from './routes/api'
import authRouter from './routes/auth'

import initDB from './db'

const app = express()

app.use(cors())
app.use(fileUpload())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(indexRouter)
app.use('/api', apiRouter)
app.use('/auth', authRouter)

app.use((_, res) => {
	res.status(404)
})

initDB().then(() => app.listen(3000, () => console.log('listening on http://localhost:3000')))
