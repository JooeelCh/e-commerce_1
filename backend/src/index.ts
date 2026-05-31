import './env.js'
import express from 'express'
import cors from 'cors'
import stripeRouter from './routes/stripe.js'

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL }))

app.use('/api/webhook', express.raw({ type: 'application/json'}))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', stripeRouter)

app.listen(process.env.PORT || 3001, () =>
  console.log('Backend corriendo en puerto 3001')
)