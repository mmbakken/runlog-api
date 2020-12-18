import express from 'express'
//import cors from 'cors'

const app = express()
const port = 4000

//app.use(cors())

app.get('/api/v1', (req, res) => {
  res.send('Runlog API v1 ✌️')
})

app.get('/api/v1/hello', (req, res) => {
  res.send('Runlog API says: "hello, stranger 👁️👄👁️"')
})

app.listen(port, () => {
  console.log(`Magic happens at port ${port}`)
})
