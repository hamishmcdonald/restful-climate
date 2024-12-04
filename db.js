const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const  
 connect = async () => { // renamed for clarity
  try {
    const connection = await mongoose.connect(MONGODB_URL);
    return connection;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = connect;