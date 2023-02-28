import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import path from 'path'
import cors from 'cors'
import fileUpload from 'express-fileupload'

import indexRouter from './routes/index'
import './db'

const app = express()

app.use(cors())
app.use(fileUpload())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// auth for user's contribution
app.use('/image', express.static(path.join(__dirname, 'image')))

app.use(indexRouter)

app.use((_, res) => {
	res.status(404)
})

app.listen(3000, () => console.log('listening on http://localhost:3000'))
