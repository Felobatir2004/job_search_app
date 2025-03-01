import connectDB from "./DB/connection.js"
import authRouter from "./Modules/Auth/auth.controller.js"
import { globalErrorHandler, notFoundHandler } from "./utils/error handling/asyncHandler.js"
import cors from "cors";
import morgan from "morgan"

const bootstrap = async (app, express)=>{

    await connectDB()


    app.use(morgan("dev"));



    app.use(express.json());

    app.use("/uploads", express.static("uploads"));
    app.use(cors())

    app.get("/",(req,res)=> res.send("Hello world"))


    app.use("/auth",authRouter)
    app.all("*",notFoundHandler)
    app.use(globalErrorHandler)
}

export default bootstrap