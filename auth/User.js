const jwt = require("jsonwebtoken")

function setUser(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET)
}

function getUser(token) {
    return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { setUser, getUser }
