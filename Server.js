const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const UserRoute = require("./Routes/Quiz")
const StudentRoute = require("./Routes/Student")

const connectDB = require("./Config/db")

const User = require("./Models/User")
const UserQuiz = require('./Models/Quiz')
const authUser = require("./Middleware/AdminMiddleware")

const app = express()

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// Routes
app.use("/admin", UserRoute)
app.use("/student", StudentRoute)

// Connect Database
connectDB()



app.listen(8000, () => {
    console.log("Server Started...", 8000);
})