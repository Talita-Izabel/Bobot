import express from 'express'
import cors from 'cors'
import accessEnv from '../../helpers/accessEnv.js'
import setupRoutes from './routes/index.js'
import https from 'https'
import fs from 'fs'

const port = accessEnv('PORT', 4003)
const app = express()

const privateKey = fs.readFileSync(process.env.PRIVKEY, 'utf8')
const certificate = fs.readFileSync(process.env.FULLCHAIN, 'utf8')
const server = https.createServer(
  { key: privateKey, cert: certificate, rejectUnauthorized: false },
  app
)

app.use(
  cors({
    origin: (origin, callback) => {
      const originsAllowed = process.env.CORS_ORIGIN_ALLOWED
      if (
        originsAllowed === '*' ||
        originsAllowed.split(',').indexOf(origin) !== -1
      ) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    optionsSuccessStatus: 200,
  })
)
app.set('trust proxy', true)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

setupRoutes(app)

server.listen(port, () => {
  console.log(`Rodando na porta ${port}`)
})
