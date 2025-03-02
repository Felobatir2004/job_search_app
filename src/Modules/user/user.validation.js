import joi from "joi"
import { generalField } from "../../middlewares/validation.middleware.js"
export const updateUserSchema = joi
.object({
    firstName: generalField.firstName,
    lastName:generalField.lastName,
    userId:generalField.id
}).required()
export const getUserAccountSchema = joi
