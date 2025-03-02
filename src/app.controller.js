import connectDB from "./DB/connection.js"
import authRouter from "./Modules/Auth/auth.controller.js"
import userRouter from "./Modules/user/user.controller.js"
import deleteExpiredOTPs from "./utils/cronJobs/cronJobs.js";
import { globalErrorHandler, notFoundHandler } from "./utils/error handling/asyncHandler.js"
import cors from "cors";
import morgan from "morgan"
import session from 'express-session';
import passport from 'passport'
import"./Modules/Auth/googleAuth.js"
import googleAuthRouter from "./Modules/Auth/googleAuth.router.js"
const bootstrap = async (app, express)=>{

    await connectDB()


    app.use(morgan("dev"));


    deleteExpiredOTPs();
    app.use(express.json());

    app.use("/uploads", express.static("uploads"));
    app.use(cors())

    app.get("/",(req,res)=> res.send("Hello world"))

    app.use(session({ secret: 'yourSecretKey', resave: false, saveUninitialized: true }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/googleAuth', googleAuthRouter);


    app.use("/auth",authRouter)
    app.use("/user",userRouter)

    app.all("*",notFoundHandler)
    app.use(globalErrorHandler)
}

export default bootstrap