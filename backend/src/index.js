import dotenv from 'dotenv' 
// Import dotenv package
// It loads environment variables from a .env file into process.env

import { app } from './app.js' 
// Import Express app instance from app.js
// app.js usually contains middleware + routes configuration

import connectDB from './db/index.js' 
// Import your database connection function
// This function connects your app to MongoDB (or any DB you're using)

dotenv.config({
    path: './env'
}) 
// Load environment variables from a file named "env"
// Now you can access variables like process.env.PORT, process.env.MONGO_URI, etc.

connectDB()
// Call the database connection function
// It returns a Promise (because DB connection is async)

.then(() => {
  // If database connects successfully

  app.listen(process.env.PORT || 8000, () => {
    // Start Express server
    // Use PORT from environment file
    // If not defined, default to 8000

    console.log(`server is running on ${process.env.PORT}`)
    // Log confirmation that server started
  })

})
.catch((err) => {
  // If database connection fails

  console.log("Error in connecting to DB !!", err);
  // Print error so you know what went wrong
})


























/*
import express from "express";

const app=express();
(async()=>{
    try {
      await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("ERR:",error);
        throw err
      })
      app.listen(process.env.PORT,()=>{
        console.log(`server is running on ${process.env.PORT}`)
      })
    } catch (error) {
        console.error("ERROR",error)
        throw err
    }
}) */
