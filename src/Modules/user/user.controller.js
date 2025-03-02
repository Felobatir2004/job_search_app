import {Router} from "express"
import * as userService from "./user.service.js"
import * as userValidation from "./user.validation.js"
import { validation } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { authentication } from "../../middlewares/auth.middleware.js";

const router = Router()

router.patch(
    "/update/:userId",
    authentication(),
    validation(userValidation.updateUserSchema),
    asyncHandler(userService.updateUser)
)
router.get(
    "/getLoginUserData",
    authentication(),
    asyncHandler(userService.getLoginUserData)
)

export default router