import {Router} from "express"
import * as companyService from "./company.service.js"
import * as companyValidation from "./company.validation.js"
import { validation } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
import { fileValidation, uploadCloud } from "../../utils/fileUploading/multerCloud.js";

const router = Router()

router.post(
    "/create",
    authentication(),
    allowTo(["User"]),
    validation(companyValidation.createCompanySchema),
    asyncHandler(companyService.addCompany)
)
router.patch(
    "/update/:companyId",
    authentication(),
    allowTo(["User"]),
    validation(companyValidation.updateCompanySchema),
    asyncHandler(companyService.updateCompany)
)
router.patch(
    "/softDelete/:companyId",
    authentication(),
    allowTo(["User","Admin"]),
    validation(companyValidation.softDeleteSchema),
    asyncHandler(companyService.softDelete)
)

router.get(
    "/getCompanyWithName",
    authentication(),
    allowTo(["User","Admin"]),
    validation(companyValidation.getCompanySchema),
    asyncHandler(companyService.searchComapnyWithName)
)
router.get(
    "/getCompanyWithJobs/:companyId",
    authentication(),
    allowTo(["User","Admin"]),
    asyncHandler(companyService.getCompanyWithJobs)
)

router.post(
    "/uploadLogo/:companyId",
    authentication(),
    allowTo(["User"]),
    uploadCloud().single("image"),
    validation(companyValidation.uploadlogoSchema),
    asyncHandler(companyService.uploadlogo)
)
router.post(
    "/uploadCover/:companyId",
    authentication(),
    allowTo(["User"]),
    uploadCloud().single("image"),
    validation(companyValidation.uploadCoverSchema),
    asyncHandler(companyService.uploadCover)
)
router.delete(
    "/deleteLogo/:companyId",
    authentication(),
    allowTo(["User"]),
    validation(companyValidation.deleteLogoSchema),
    asyncHandler(companyService.deleteLogo)
)
router.delete(
    "/deleteCover/:companyId",
    authentication(),
    allowTo(["User"]),
    validation(companyValidation.deleteCoverSchema),
    asyncHandler(companyService.deleteCover)
)
export default router