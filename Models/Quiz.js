const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },

        subject: {
            type: String,
        },

        difficulty: {
            type: String,
            default: "medium",
            enum: ["Easy", "Medium", "Hard"],
        },

        timing: {
            type: {
                type: String,
                enum: ["Duration", "Scheduled"],
                default: "Duration",
                required: true,
            },

            durationMinutes: {
                type: Number,
                default: null,
            },

            startTime: {
                type: Date,
                default: null,
            },

            endTime: {
                type: Date,
                default: null,
            },
        },
        closeIn: {
            type: Number
        },
        totalQuestions: {
            type: Number,
        },

        status: {
            type: String,
            enum: ["Open", "Closed", "Scheduled", "Draft", "Paused"],
            default: "Closed",
        },

        submitted: {
            type: Number,
            default: 0,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",

        },

        scoresGenerated: {
            type: Boolean,
            default: false,
        },

        questions: [
            {
                questionText: {
                    type: String,

                },
                options: {
                    type: [String],

                },
                correctOptionIndex: {
                    type: String,

                },
                marks: {
                    type: Number,
                    default: 1,
                },
                questionNumber: {
                    type: Number,
                },
            },
        ],
        // negativeMarking: {
        //     enabled: Boolean,
        //     marks: Number,
        // },
        // passingMarks: Number,
        // maxAttempts: {
        //     type: Number,
        //     default: 1
        // },
        // quizCode: {
        //     type: String,
        //     unique: true
        // }
    },
    {
        timestamps: true,
    }

);

module.exports = mongoose.model("UserQuiz", quizSchema);
