const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
    {
        quizId: {
            type: String,
            required: true
        },
        quizMeta: {
            title: {
                type: String,
                required: true,
            },

            subject: {
                type: String,
                required: true,
            },
            createdBy: {
                name: {
                    type: String,
                    required: true,
                },
            },

        },

        student: {
            name: {
                type: String,
                required: true,
            },

            email: {
                type: String,
                required: true,
            },

            roll: {
                type: String,
                required: true
            },

            section: {
                type: String,
            },

            semester: {
                type: String,
            },

            branch: {
                type: String,
            },

            year: {
                type: String,
            },
        },

        answer: [
            {
                _id: false,

                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                },

                questionText: {
                    type: String,
                    required: true,
                },

                selectAnswerIndex: {
                    type: String,
                    required: true,
                },
                status: {
                    type: String,
                    required: true,
                },
                flagged: {
                    type: Boolean,
                    default: false,
                    required: true,
                },
            },
        ],

        validatedAnswer: [
            {
                _id: false,

                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                },

                selectedOption: {
                    type: String,
                    required: true,
                },
                isCorrect: {
                    type: Boolean,
                }
            },
            { _id: false }],

        quizDuration: {
            type: Number,
            required: true,
        },

        submittedInSec: {
            type: Number,
            required: true,
        },
        obtainMarks: {
            required: true,
            type: Number

        },
        quizTotalMarks: {
            type: Number
        },
        notAnswered: {
            required: true,
            type: Number
        },
        wrongQuestion: {
            type: Number
        },
        correctAnswers: {
            required: true,
            type: Number
        },
        percentage: {
            required: true,
            type: Number
        }
    },
    {
        timestamps: true,
    },
);


module.exports = mongoose.model("QuizResponse", responseSchema);