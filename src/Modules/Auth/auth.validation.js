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

export const confirmEmailSchema = joi
.object({
    email: generalField.email.required(),
    code: generalField.code.required()
}).required()

export const signInSchema = joi
.object({
    email: generalField.email.required(),
    password: generalField.password.required(),
}).required()

export const forgetPasswordSchema = joi
.object({
    email: generalField.email.required(),
}).required()

export const resetPasswordSchema = joi
.object({
    email: generalField.email.required(),
    code: generalField.code.required(),
    password: generalField.password.required(),
    confirmPassword: generalField.confirmPassword.required(),
}).required()

