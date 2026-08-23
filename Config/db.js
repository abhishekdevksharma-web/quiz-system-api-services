
const mongoose = require("mongoose")
const dns = require("dns");


async function connectDB() {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  try {
    await mongoose.connect("mongodb+srv://sharmaabhishek04925_db_user:N0ZcTJ0sA85uo9sA@cluster0.1sar7an.mongodb.net/");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};


module.exports = connectDB