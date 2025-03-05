import {Router} from "express"
import * as adminService from "./admin.service.js"
import * as adminValidation from "./admin.validation.js"
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";

const router = Router()

router.patch(
    "/banOrUnbanUser/:userId",
    authentication(),
    allowTo(["Admin"]),
    validation(adminValidation.banOrUnbanUserSchema),
    asyncHandler(adminService.banOrUnbanUser)
)

router.patch(
    "/banOrUnbanCompany/:companyId",
    authentication(),
    allowTo(["Admin"]),
    validation(adminValidation.banOrUnbanCompanySchema),
    asyncHandler(adminService.banOrUnbanCompany)
)

router.patch(
    "/approveCompany/:companyId",
    authentication(),
    allowTo(["Admin"]),
    validation(adminValidation.approveCompanySchema),
    asyncHandler(adminService.approveCompany)
)
export default router