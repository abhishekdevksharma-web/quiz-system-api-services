const UserQuiz = require("../Models/Quiz");

async function validateQuizAnswer(data, userQuiz) {
    let obtainMarks = 0;
    let quizTotalMarks = 0;

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let notAnswered = 0;

    const validatedAnswer = [];
    console.log(userQuiz);


    userQuiz.questions.forEach((question) => {
        quizTotalMarks += question.marks;

        data.answer.forEach((answer) => {
            if (
                question._id.toString() === answer.questionId.toString()
            ) {
                const {
                    questionText,
                    selectAnswerIndex,
                    ...rest
                } = answer;

                const isNotAnswered = answer.status === "unanswered";

                const isCorrect =
                    !isNotAnswered &&
                    question.correctOptionIndex?.toString() ===
                    answer.selectAnswerIndex.toString();

                validatedAnswer.push({
                    ...rest,
                    questionId: answer.questionId,
                    selectedOption: answer.selectAnswerIndex,
                    isCorrect,
                });

                if (isNotAnswered) {
                    notAnswered++;
                } else if (isCorrect) {
                    correctAnswers++;
                    obtainMarks += question.marks;
                } else {
                    wrongAnswers++;
                }
            }
        });
    });

    // Calculate percentage
    const percentage =
        quizTotalMarks > 0
            ? Math.round((obtainMarks / quizTotalMarks) * 100)
            : 0;

    return {
        validatedAnswer,
        obtainMarks,
        quizTotalMarks,
        percentage,
        correctAnswers,
        wrongAnswers,
        notAnswered,
    };
}

module.exports = validateQuizAnswer;