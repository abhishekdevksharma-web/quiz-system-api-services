const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },
        role: {
            type: String, default: "student"
        },

        info: {
            roll: {
                type: String,
            },

            section: {
                type: String,
            },

            year: {
                type: Number,
            },

            sem: {
                type: Number,
            },
        },

        recentQuiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserQuiz",
            default: null,
        },

        quizHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UserQuiz",
            },
        ],
    },
    {
        timestamps: true,
    },
)

module.exports = mongoose.model("Student", studentSchema);