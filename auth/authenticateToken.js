import jwt from 'jsonwebtoken'

const authenticateToken = (req, res, next) => {
  // Format of header: 'Bearer <token>'
  const authHeader = req.headers['authorization']

  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.sendStatus(401)
  }

  // Verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }

    req.user = user
    next()
  })
}

export default authenticateToken
