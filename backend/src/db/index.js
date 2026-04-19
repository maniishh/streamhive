
import mongoose from "mongoose";
import {DB_NAME} from '../constants.js';



const conncetDB=async()=>{
    try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
        ssl: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
        console.log(`\nDB connected successfully: ${connectionInstance.connection.host}\n`);

    } catch (error) {
        console.error("DB connection error",error)
        process.exit(1)
    }
  }
export default conncetDB