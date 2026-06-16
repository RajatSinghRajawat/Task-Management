const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/task-management';
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(error);
    }
};

module.exports = connectDB;

