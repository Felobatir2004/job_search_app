import joi from "joi"
import { Types } from "mongoose"

export const isValidObjectId = (value, helper)=>{
    return Types.ObjectId.isValid(value) ? true : helper.message("invalid id")
}

export const generalField = {
    firstName: joi.string().min(3).max(30).required(),
    lastName: joi.string().min(3).max(30).required(),
    email: joi.string().email({
        minDomainSegments: 2 ,
        maxDomainSegments: 2,
        tlds: {allow :["com","net"]},
    }).required(),
    providers: joi.string().valid("Google", "System"),
    password: joi
    .string()
    .pattern(
        new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\w)(?!.* ).{8,16}$/)
    )
    .required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    gender: joi.string().valid("male", "female"),
    DOB: joi.date(),
    mobileNumber: joi.string().pattern(new RegExp(/^[0-9]{11}/)),
    role: joi.string().valid("superAdmin", "Admin", "User"),
}

export const validation = (Schema) =>{
    return (req,res,next) =>{
        const data = {...req.body, ...req.query, ...req.params}
        if(req.file || req.files?.length ){ 
            data.file = req.file || req.files
        }
        const results = Schema.validate(data, {abortEarly:false})
        if(results.error){
            const errorMessage = results.error.details.map((obj)=>obj.message)
            return res.status(400).json({success: false, message:errorMessage})
        }
        return next()
    }
}