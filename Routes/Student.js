const express = require("express")
const QuizResponse = require('../Models/Responce')
const UserQuiz = require('../Models/Quiz')
const Student = require('../Models/student')
const validateQuizAnswer = require("../Controller/quizController")
const authUser = require("../Middleware/AdminMiddleware");


const router = express.Router()

//student get quiz
router.get("/:id", async (req, res) => {
    try {
        const quiz = await UserQuiz.findById(
            req.params.id,
            "title subject status totalQuestions timing difficulty createdAt"
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        res.json({
            success: true,
            quiz,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch quiz",
        });
    }
});

router.get("/start-quiz/:quizId", async (req, res) => {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Quiz ID is required",
            });
        }

        const quiz = await UserQuiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        return res.status(200).json({
            success: true,
            quiz,
        });
    } catch (error) {
        console.error("Error starting quiz:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to start quiz",
            error: error.message,
        });
    }
});

router.post("/validateanswer", async (req, res) => {

    try {
        const { quizId, student, answer, quizDuration, submittedIn, studentId } = req.body


        const userQuiz = await UserQuiz.findOne({ _id: quizId })

        const { title, subject } = userQuiz

        if (!userQuiz) {
            return res.status(404).json({
                status: true,
                value: {
                    type: "error",
                    message: "Quiz Not Found"
                }
            })
        }

        if (!userQuiz.status === "Open") {
            return res.status(403).json({
                status: true,
                value: {
                    type: "error",
                    message: `Quiz has been ${userQuiz.status}. Submission is no longer allowed.`
                },
            });
        }
        const {
            validatedAnswer,
            obtainMarks,
            quizTotalMarks,
            correctAnswers,
            wrongAnswers,
            notAnswered,
            percentage
        } = await validateQuizAnswer(req.body, userQuiz)

        const reqUserQuiz = await QuizResponse.findOne({
            "student.email": student.email,
            "quizId": quizId
        });

        if (!reqUserQuiz || true) {
            const savedResponse = await QuizResponse.create({
                quizId, quizMeta: {
                    title, subject,
                    createdBy:
                    {
                        name: userQuiz.createdBy.name
                    }
                },
                student, answer, validatedAnswer, quizDuration, submittedInSec: submittedIn,
                obtainMarks,
                quizTotalMarks,
                correctAnswers,
                wrongAnswers,
                notAnswered,
                percentage
            })

            await UserQuiz.findByIdAndUpdate(quizId, { $inc: { submitted: 1 } })

            await Student.findByIdAndUpdate(
                studentId,
                {
                    $set: {
                        recentQuiz: savedResponse._id,
                    },
                    $addToSet: {
                        quizHistory: savedResponse._id,
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            return res.status(200).json({
                success: true,
                message: "Your Response Submitted",

                data: {
                    quiz: {
                        quizId: userQuiz._id,
                        title: userQuiz.title,
                        subject: userQuiz.subject,

                        totalQuestions: userQuiz.totalQuestions,

                        totalMarks: quizTotalMarks,
                        obtainedMarks: savedResponse.obtainMarks,

                        submittedIn: savedResponse.submittedInSec,
                        submittedAt: savedResponse.createdAt,

                        correctAnswers,
                        wrongAnswers,
                        notAnswered
                    }
                }
            });
        }


        if (reqUserQuiz.student.email === student.email) {
            return res.status(409).json({
                success: false,
                errorCode: 101,
                message: "Email already exists OR Already Responded!",
                data: {
                    quizId
                }
            });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }



})

router.get("/quiz/search", async (req, res) => {
    try {
        const { q } = req.query;

        if (!q?.trim()) {
            return res.status(400).json({
                message: "Search query is required",
            });
        }

        // const quizzes = await UserQuiz.find({
        //     _id: q.trim(),
        // }, "title subject status difficulty totalQuestions timing.durationMinutes");

        const quizzes = await UserQuiz.aggregate([
            // 1. Filter
            {
                $match: {
                    title: q,
                },
            },

            // 2. Sort
            {
                $sort: {
                    createdAt: -1,
                },
            },

            // 3. Select fields
            {
                $project: {
                    title: 1,
                    subject: 1,
                    status: 1,
                    difficulty: 1,
                    totalQuestions: 1,
                    "timing.durationMinutes": 1,
                    createdAt: 1,
                },
            },

            // 4. Limit
            {
                $limit: 10,
            },
        ]);


        return res.status(200).json({
            quizzes,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to search quizzes",
        });
    }
})

router.get("/quiz/history", authUser, async (req, res) => {
    try {
        const email = req.user.findedUser.email;


        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 10, 50);

        const skip = (page - 1) * limit;

        const history = await QuizResponse.find({ "student.email": email })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await QuizResponse.countDocuments({ "student.email": email });

        return res.status(200).json({
            success: true,
            data: history,
            pagination: {
                page,
                limit,
                total,
                hasMore: skip + history.length < total,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch quiz history",
        });
    }
});

module.exports = router