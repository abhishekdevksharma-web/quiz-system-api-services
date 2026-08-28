const express = require("express");
const authUser = require("../Middleware/AdminMiddleware");
const router = express.Router()

router.get('/verify-token', authUser, async (req, res) => {
    try {
        const { name, email, userId } = req.user.findedUser

        return res.status(200).json({
            success: true,
            message: "Token is valid",
            user: {
                userId,
                name,
                email
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to process the request"
        });
    }
})
router.post("/logout", (req, res) => {
    res.clearCookie("Access-Token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // production me true
    });

    return res.status(200).json({
        success: true,
        message: "Logout successful"
    });
});

module.exports = router