import * as dbService from "../../DB/dbService.js"
import { UserModel } from "../../DB/Models/user.model.js"
import { emailEmitter } from "../../utils/email/email.event.js"
import { otp } from "../../utils/email/email.event.js"
export const signUp = async  (req,res,next)=>{
    const {firstName, lastName, email , password  , gender , mobileNumber}= req.body

    const user = await dbService.findOne({model: UserModel , filter: {email}})
    if(user) return next (new Error("User already exists",{cause: 409}))

    const newUser = await dbService.create({
        model: UserModel,
        data:{
        firstName,
        lastName, 
        email , 
        password,
        gender,
        mobileNumber,
        OTP:[{
            code:otp,
            expiresIn:Date.now() + 5 * 60 * 1000,
        }]
        },

    })
    
    emailEmitter.emit("sendEmail",email,newUser.userName,newUser._id)
    return res.status(200).json({success:true , message :"user Registered successfully", newUser})
}