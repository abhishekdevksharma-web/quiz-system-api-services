const express = require("express");

const UserQuiz = require("../Models/Quiz")
const User = require("../Models/User")
const QuizResponse = require('../Models/Responce')

const authUser = require("../Middleware/AdminMiddleware")
const { setUser } = require("../auth/User");
const TokenSchema = require("../Models/Token");
const { default: mongoose } = require("mongoose");

require("dotenv").config();

const router = express.Router()

router.post("/createquiz", authUser, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const quizMeta = req.body;

        const {
            title,
            subject,
            difficulty,
            totalQuestions,
            timing,
            tag,
            status,
            attempts
        } = req.body;

        const created = await UserQuiz.create([{
            title,
            subject,
            difficulty,
            timing,
            totalQuestions,
            tag,
            status,
            attempts,
            isActive: true,
            createdBy: req.user.findedUser?._id,
            questions: quizMeta.questions.questions
        }], { session });

        const quiz = created[0];

        const updatedUser = await User.findByIdAndUpdate(
            req.user.findedUser?._id,
            {
                $inc: {
                    totalQuizs: 1
                },
                $push: {
                    recentQuizzes: {
                        $each: [quiz._id],
                        $position: 0,
                        $slice: 5
                    }
                }
            },
            { session, new: true }
        );

        if (!updatedUser) {
            throw new Error("User not found");
        }

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            _id: quiz._id
        });

    } catch (error) {

        console.error("Create quiz error:", error);

        await session.abortTransaction();

        if (error.message === "User not found") {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create quiz"
        });

    } finally {
        session.endSession();
    }

})

router.get("/fetchallquiz", authUser, async (req, res) => {


    const userQuizess = await UserQuiz.find({ createdBy: req.user.findedUser._id })

    res.status(200).json(userQuizess)
})

router.get("/dashbord", authUser, async (req, res) => {

    const user = await User
        .findById(req.user.findedUser._id)
        .populate("recentQuizzes").select("-password -quizzes")

    const activeQuizzes = await UserQuiz.find({
        createdBy: req.user.findedUser._id,
        status: "Open",
    }, "title submitted subject timing status");



    res.status(200).json({ user, loginStatus: req.user.loginStatus, activeQuizzes })
})

router.post("/createuser", async (req, res) => {
    try {
        const { name, email, password } = req.body
        const user = new User({
            name,
            email,
            password
        })


        user.save()

        res.send(true)

    } catch (error) {
        console.log(error);
    }
})
router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body

        const findUser = await User.findOne({ email, password }, 'name email _id');

        if (!findUser) {
            res.status(400).json({ status: false })
        }

        const payload = {
            userId: findUser._id.toString(),
            name: findUser.name,
            email: findUser.email
        }
        const token = setUser(payload)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await TokenSchema.create({
            userId: findUser._id,
            token,
            expiresAt,
            isValid: true,
        });


        res.cookie("Access-Token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: expiresAt,
        });

        res.status(200).json({ findUser, status: true })


    } catch (error) {
        console.log(error);
    }
})

router.patch("/updatequizstatus", authUser, async (req, res) => {
    try {
        const { status, quizId } = req.body;

        const updatedQuiz = await UserQuiz.findByIdAndUpdate(
            quizId,
            {
                $set: {
                    "status": status,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedQuiz) {
            return res.status(404).json({
                status: false,
                message: "Quiz not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Timing status updated successfully",
            quiz: updatedQuiz,
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message,
        });
    }
});

router.post("/quiz-responce-results", async (req, res) => {
    try {

        const { quizId } = req.body

        const students = await QuizResponse.find({ quizId },
            "quizId student submittedInSec totalMarks obtainMarks quizDuration")

        res.status(200).json({
            status: true,
            students
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
})
router.patch("/update-quiz-settings", authUser, async (req, res) => {
    try {
        const { defaultSecurityChecks, timeLimit, quizId
        } = req.body;

        const updatedQuiz = await UserQuiz.findByIdAndUpdate(
            quizId,
            {
                $set: {
                    securityCheckType: defaultSecurityChecks, userTimeLimit: timeLimit
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedQuiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Timing status updated successfully",
            quiz: updatedQuiz,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

module.exports = router
