const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 10000
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
