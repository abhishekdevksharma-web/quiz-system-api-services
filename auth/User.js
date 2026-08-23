const jwt = require("jsonwebtoken")
const secret = "abhishek"

function setUser(user) {
    return jwt.sign({ id: user }, secret)
}

function getUser(token) {    
    return jwt.verify(token, secret)
}

module.exports = { setUser, getUser }
