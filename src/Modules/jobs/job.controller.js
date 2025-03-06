import {Router} from "express"
import * as jobService from "./job.service.js"
import * as jobValidation from "./job.validation.js"
import { validation } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
import { fileValidation, uploadCloud } from "../../utils/fileUploading/multerCloud.js";

const router = Router({mergeParams:true})

router.post(
    "/create/:companyId",
    authentication(),
    allowTo(["User"]),
    validation(jobValidation.creaateJobSchema),
    asyncHandler(jobService.createJob)
)
router.patch(
    "/update/:jobId",
    authentication(),
    allowTo(["User"]),
    asyncHandler(jobService.updateJob)
)

router.delete(
    "/delete/:jobId",
    authentication(),
    allowTo(["User"]),
    validation(jobValidation.deleteJobSchema),
    asyncHandler(jobService.deleteJob)
)

router.get(
    "/:companyId/jobs/:jobId?",
    authentication(),
    allowTo(["User"]), 
    asyncHandler(jobService.getJobsForCompany)
)

router.get(
    "/",
    authentication(),
    allowTo(["User"]), 
    asyncHandler(jobService.getAllJobs)
)
router.get(
    "/getJobApplication/:jobId",
    authentication(),
    allowTo(["User","Admin"]), 
    validation(jobValidation.getAllApplicationsForJobSchema),
    asyncHandler(jobService.getAllApplicationsForJob)
)
router.post(
    "/applyToJob/:jobId",
    authentication(),
    allowTo(["User"]), 
    uploadCloud().single("application"),
    validation(jobValidation.applyToJobSchema),
    asyncHandler(jobService.applyToJob),
)

router.patch(
    "/acceptAndRejectApplication/:applicationId",
    authentication(),
    allowTo(["User"]), 
    validation(jobValidation.updateApplicationSchema),
    asyncHandler(jobService.updateApplicationStatus),
)
export default router