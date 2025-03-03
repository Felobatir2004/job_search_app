import joi from "joi"
import { generalField } from "../../middlewares/validation.middleware.js"
export const createCompanySchema = joi
.object({
    companyName:generalField.companyName.required(),
    description:generalField.description.required(),
    industry:generalField.industry.required(),
    address:generalField.address,
    numberOfEmployees:generalField.numberOfEmployees.required(),
    companyEmail:generalField.companyEmail.required(),
    HRs:generalField.HRs
}).required()
export const updateCompanySchema = joi
.object({
    companyName:generalField.companyName,
    description:generalField.description,
    industry:generalField.industry,
    address:generalField.address,
    numberOfEmployees:generalField.numberOfEmployees,
    companyEmail:generalField.companyEmail,
    HRs:generalField.HRs
})
export const softDeleteSchema = joi
.object({
    companyId: generalField.id.required(),
})
export const getCompanySchema = joi
.object({
    companyName: generalField.companyName.required(),
})
export const uploadlogoSchema = joi
.object({
    companyId: generalField.id.required(),
    file: joi.any(),
})
export const uploadCoverSchema = joi
.object({
    companyId: generalField.id.required(),
    file: joi.any(),
})
export const deleteLogoSchema = joi
.object({
    companyId: generalField.id.required(),
})
export const deleteCoverSchema = joi
.object({
    companyId: generalField.id.required(),
})