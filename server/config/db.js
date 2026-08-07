const mongoose = require('mongoose');
const { logInfo, logError } = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logInfo(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logError(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;