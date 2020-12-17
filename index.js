import express from 'express'
import cors from 'cors'

const app = express()
const port = 4000

app.use(cors())

app.get('/', (req, res) => {
  res.send('Runlog API :)')
})

app.listen(port, () => {
  console.log(`Magic happens at port ${port}`)
})
