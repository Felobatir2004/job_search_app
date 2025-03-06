import connectDB from "./DB/connection.js"
import authRouter from "./Modules/Auth/auth.controller.js"
import userRouter from "./Modules/user/user.controller.js"
import companyRouter from "./Modules/company/company.controller.js"
import jobRouter from "./Modules/jobs/job.controller.js"
import chatRouter from "./Modules/Chat/chat.controller.js"
import adminRouter from "./Modules/Admin/admin.controller.js"
import deleteExpiredOTPs from "./utils/cronJobs/cronJobs.js";
import { globalErrorHandler, notFoundHandler } from "./utils/error handling/asyncHandler.js"
import cors from "cors";
import morgan from "morgan"
import {rateLimit} from "express-rate-limit"
import { createHandler } from "graphql-http/lib/use/express"
import {schema} from "./Modules/app.graph.js"


const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit:7,
    message:"Too many requests from this IP, please try again after 5 minutes",
    statusCode:429,

    handler:  (req, res, next, options) => {
        return next(new Error(options.message, { cause: options.statusCode }))
    },

})
const bootstrap = async (app, express)=>{

    await connectDB()


    app.use(morgan("dev"));


    deleteExpiredOTPs();
    app.use(express.json());

    app.use("/uploads", express.static("uploads"));
    app.use(cors())
    app.use(limiter);
    app.get("/",(req,res)=> res.send("Hello world"))



    app.use("/graphql",createHandler({schema: schema}))

    app.get("/",(req,res)=> res.send("Hello world"))
    app.use("/auth",authRouter)
    app.use("/user",userRouter)
    app.use("/company",companyRouter)
    app.use("/job",jobRouter)
    app.use("/chat",chatRouter)
    app.use("/admin",adminRouter)



    app.all("*",notFoundHandler)
    app.use(globalErrorHandler)
}

export default bootstrap