const mongoose = require('mongoose');
require("dotenv").config();

const mongoURI = process.env.DATABASE_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            authSource: "mydb"
        });
        console.log("MongoDB Connected");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = connectDB;
