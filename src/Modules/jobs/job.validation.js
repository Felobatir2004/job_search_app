import joi from "joi"
import { generalField } from "../../middlewares/validation.middleware.js"
export const creaateJobSchema = joi
.object({
    companyId:generalField.id.required(),
    jobTitle:generalField.jobTitle.required(),
    jobLocation:generalField.jobLocation.required(),
    workingTime:generalField.workingTime.required(),
    seniorityLevel:generalField.seniorityLevel.required(),
    jobDescription:generalField.jobDescription.required(),
    technicalSkills:generalField.technicalSkills.required(),
    softSkills:generalField.softSkills.required(),
})

export const deleteJobSchema = joi
.object({
    jobId:generalField.id.required(),
})

