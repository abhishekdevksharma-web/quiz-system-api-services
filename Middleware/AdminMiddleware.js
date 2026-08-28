const { getUser } = require("../auth/User")
const User = require("../Models/User")
const TokenSchema = require("../Models/Token")
const authUser = async (req, res, next) => {

    const { 'Access-Token': accessToken } = req.cookies;
    let user
    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }
    try {
        user = getUser(accessToken)
        const isUser = await TokenSchema.findOne({
            userId: user.userId,
            token: accessToken
        });
        if (!isUser) {
            return res.status(401).json({
                success: false,
                message: "Session invalid"
            });
        }
        if (!(isUser.isValid)) {
            return res.status(401).json({
                success: false,
                message: "Session Expired"
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
    try {
        const findedUser = await User.findById({ _id: user.userId }, '_id name email')
        req.user = { findedUser, loginStatus: true }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "User not found"
        });
    }

}
module.exports = authUser