const express = require("express")
const QuizResponse = require('../Models/Responce')
const UserQuiz = require('../Models/Quiz')
const validateQuizAnswer = require("../Controller/quizController")


const router = express.Router()

//student get quiz
router.get("/:id", async (req, res) => {
    const id = req.params.id

    const findQuiz = await UserQuiz.findById({ _id: id })


    res.json(findQuiz)
})


router.post("/validateanswer", async (req, res) => {

    try {

        const { quizId, student, answer, quizDuration, submittedInSec } = req.body
        const { validatedAnswer, obtainMarks, totalMarks } = await validateQuizAnswer(req.body)


        const reqUserQuiz = await QuizResponse.findOne({
            "student.email": student.email,
            "quizId": quizId
        });

        const userQuiz = await UserQuiz.findOne({ _id: quizId })

        if (!userQuiz) {
            return res.status(404).json({
                status: true,
                value: {
                    type: "error",
                    message: "Quiz Not Found"
                }
            })
        }

        if (!reqUserQuiz) {

            if (userQuiz.status === "Closed") {
                return res.status(403).json({
                    status: true,
                    value: {
                        type: "error",
                        message: "Quiz has been closed. Submission is no longer allowed."
                    },
                });
            }

            if (userQuiz.status === "Open") {

                const ress = await QuizResponse.create({
                    quizId, student, answer, validatedAnswer, quizDuration, submittedInSec, obtainMarks, totalMarks
                })

                await UserQuiz.findByIdAndUpdate(quizId, { $inc: { submitted: 1 } })

                res.status(200).json({
                    status: true,

                    value: { type: "result", message: "Your Responce Submitted", studentQuizDetails: obtainMarks, quizId, submittedInSec }

                })
            }
        }

        if (reqUserQuiz) {
            if (reqUserQuiz.student.email === student.email) {
                return res.status(409).json({
                    status: true,

                    value: {
                        message: "Email already exists OR Already Responded!", type: "error", studentQuizDetails: obtainMarks, quizId, submittedInSec
                    }
                });
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: false,
            message: "Internal Server Error"
        });
    }



})

module.exports = router