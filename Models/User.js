const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
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

        totalQuizs: {
            type: Number,
            default: 0,
        },

        recentQuizzes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UserQuiz",
            },
        ],

        quizzes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UserQuiz",
            },
        ],
    },
    {
        timestamps: true,
    }
);
 

module.exports = mongoose.model("User", userSchema);