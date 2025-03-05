import joi from "joi"
import {generalField} from "../../middlewares/validation.middleware.js"
export const banOrUnbanUserSchema = joi
.object({
    userId: generalField.id.required(),

}).required()

export const banOrUnbanCompanySchema = joi
.object({
    companyId: generalField.id.required(),

}).required()

export const approveCompanySchema = joi
.object({
    companyId: generalField.id.required(),
}).required()