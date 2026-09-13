const { getUser } = require("../auth/User");
const User = require("../Models/User");
const TokenSchema = require("../Models/Token");

const clearAuthCookie = (res) => {
    res.clearCookie("Access-Token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
};

const authUser = async (req, res, next) => {

    const { "Access-Token": accessToken } = req.cookies;

    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    let user;

    // Token verify
    try {
        user = getUser(accessToken);

        // Token invalid/tampered
        if (!user || !user.userId) {
            clearAuthCookie(res);

            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

    } catch (err) {
        console.log("Token error:", err);

        // Tampered / malformed / invalid token
        clearAuthCookie(res);

        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }

    // Check session in DB
    try {
        const isUser = await TokenSchema.findOne({
            userId: user.userId,
            token: accessToken
        });

        // Token DB mein nahi hai
        if (!isUser) {
            clearAuthCookie(res);

            return res.status(401).json({
                success: false,
                message: "Session invalid"
            });
        }

        // Token expired / invalid
        if (!isUser.isValid) {
            clearAuthCookie(res);

            return res.status(401).json({
                success: false,
                message: "Session Expired"
            });
        }

    } catch (err) {
        console.log("Session error:", err);

        clearAuthCookie(res);

        return res.status(401).json({
            success: false,
            message: "Session validation failed"
        });
    }

    // Find user
    try {
        const findedUser = await User.findById(
            user.userId,
            "_id name email role"
        );

        if (!findedUser) {
            clearAuthCookie(res);

            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = {
            findedUser,
            loginStatus: true
        };

        next();

    } catch (error) {
        console.log("User error:", error);

        clearAuthCookie(res);

        return res.status(401).json({
            success: false,
            message: "User not found"
        });
    }
};

module.exports = authUser;