const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
    {
        quizId: {
            type: String,
            required: true
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
                id: {
                    type: Number,
                    required: true,
                },

                questionText: {
                    type: String,
                    required: true,
                },

                selectAnswerIndex: {
                    type: Number,
                    required: true,
                },
            },
        ],

        validatedAnswer: [
            {
                questionId: {
                    type: String,
                    required: true,
                },

                selectedOption: {
                    type: Number,
                    required: true,
                },
                isCorrect: {
                    type: Boolean,
                }
            }],

        quizDuration: {
            type: Number,
            required: true,
        },

        submittedInSec: {
            type: Number,
            required: true,
        },
        totalMarks: {
            type: Number
        },
        obtainMarks: {
            required: true,
            type: Number
        }
    },
    {
        timestamps: true,
    },
);


module.exports = mongoose.model("QuizResponse", responseSchema);