import joi from "joi"
import { generalField } from "../../middlewares/validation.middleware.js"
export const updateUserSchema = joi
.object({
    firstName: generalField.firstName,
    lastName:generalField.lastName,
    userId:generalField.id
}).required()
export const getProfileSchema = joi
.object({
    userId:generalField.id
}).required()

export const updatePasswordSchema = joi
.object({
    oldPassword: generalField.password.required(),
    password: generalField.password.not(joi.ref("oldPassword")).required(),
    confirmPassword:generalField.confirmPassword.required()

}).required()

export const softDeleteSchema = joi
.object({
    userId: generalField.id.required(),
})
