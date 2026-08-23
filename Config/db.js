
const mongoose = require("mongoose")
const dns = require("dns");


async function connectDB() {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};


module.exports = connectDB