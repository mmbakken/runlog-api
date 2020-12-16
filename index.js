import express from 'express'

const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Runlog API :)')
})

app.listen(port, () => {
  console.log(`Magic happens at http://localhost:${port}`)
})
