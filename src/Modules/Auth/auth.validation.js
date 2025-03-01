import joi from "joi"
import { generalField } from "../../middlewares/validation.middleware.js"
export const signUpSchema = joi.object({
    firstName: generalField.firstName.required(),
    lastName:generalField.lastName.required(),
    email:generalField.email.required(),
    password:generalField.password.required(),
    confirmPassword:generalField.confirmPassword.required(),
    providers:generalField.providers,
    gender:generalField.gender,
    DOB:generalField.DOB,
    mobileNumber:generalField.mobileNumber,
    role:generalField.role,
})