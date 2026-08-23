const { getUser } = require("../auth/User")
const User = require("../Models/User")
const authUser = async (req, res, next) => {
    const { token } = req.cookies

    
    
    if (!token) {
        return res.status(401).json({ loginStatus: false, error: "Unauthorized" });
    }
    
    
    try {
        const user = getUser(token)
        const findedUser = await User.findById(user.id)

        req.user = { findedUser, loginStatus: true }
        next();
    } catch (err) {
        return res.status(401).json({ loginStatus: false, error: "Unauthorized" });
    }

}
module.exports = authUser