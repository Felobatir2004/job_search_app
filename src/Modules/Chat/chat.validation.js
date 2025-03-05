import joi from "joi"
import { generalField } from "../../middlewares/validation.middleware.js"

export const getChatSchema = joi
.object({
    friendId: generalField.id.required()
}).required()

export const sendMessageSchema = joi
.object({
    friendId: generalField.id.required(),
    companyId: generalField.id.required(),
    message: joi.string().required()
}).required()