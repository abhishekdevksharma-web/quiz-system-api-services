const express = require("express");

const UserQuiz = require("../Models/Quiz")
const User = require("../Models/User")
const QuizResponse = require('../Models/Responce')

const authUser = require("../Middleware/AdminMiddleware")
const { setUser } = require("../auth/User");

require("dotenv").config();

const router = express.Router()

router.post("/createquiz", authUser, async (req, res) => {
    try {
        const quizMeta = req.body

        const { title, subject, difficulty, totalQuestions, timing, tag, status, attempts } = req.body

        const created = await UserQuiz.create({
            title,
            subject,
            difficulty,
            timing,
            totalQuestions,
            tag,
            status,
            isActive: true,
            createdBy: req.user.findedUser._id,
            questions: quizMeta.questions.questions
        })


        const updatedUser = await User.findByIdAndUpdate(
            req.user.findedUser._id,
            {
                $inc: {
                    totalQuizs: 1
                },
                $push: {
                    recentQuizzes: {
                        $each: [created._id],
                        $position: 0,
                        $slice: 5,
                    },
                    quizzes: created._id
                }
            },
        );

        res.status(201).json({
            success: true,
            message: "Quiz created successfully", data: created._id
        });
    } catch (error) {
        console.log(error)
        res.end()
    }

})

router.get("/fetchallquiz", authUser, async (req, res) => {
    const user = await User
        .findById(req.user.findedUser._id)
        .populate("quizzes");

    const allQuiz = user.quizzes;

    res.status(200).json(allQuiz)
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

        const findUser = await User.findOne({ email, password });


        if (findUser) {
            const token = setUser(findUser._id)
            res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
});
            res.status(200).json({ findUser, status: true })
        } else {
            res.status(400).json({ status: false })
        }

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

module.exports = router
