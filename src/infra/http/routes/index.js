import Bot from '../../../utils/Bot.js'

export default function setupRoutes(app) {
  app.get('/health', (req, res) => {
    res.status(200).send({ result: 'live' })
  })

  app.route('/webhook/bot').post(async (req, res) => {
    try {
      await Bot.verifyMessage(req.body)

      res.sendStatus(200)
    } catch (error) {
      console.error(error)
      res.sendStatus(400)
    }
  })
}
