const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const UserRoute = require("./Routes/Quiz")
const StudentRoute = require("./Routes/Student")
const AuthRoute = require("./Routes/Auth")

const connectDB = require("./Config/db")

const User = require("./Models/User")
const UserQuiz = require('./Models/Quiz')
const authUser = require("./Middleware/AdminMiddleware")

const app = express()


const PORT = process.env.PORT || 8000;
app.use(cors({
    origin: process.env.VITE_APP_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/admin", UserRoute)
app.use("/student", StudentRoute)
app.use("/api/auth", AuthRoute)

// Connect Database
connectDB()


app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
