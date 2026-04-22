import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({
    limit:"16kb"
}));// to parse json data from request body
app.use(express.urlencoded({extended:true,limit:"16kb"}))// to parse urlencoded data from request body
app.use(express.static('public'))// to serve static files from public folder
app.use(cookieParser())// to parse cookies from request headers

//routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users",userRouter)

import searchRouter from "./routes/search.routes.js";
app.use("/api/v1/search", searchRouter);



export { app} 
