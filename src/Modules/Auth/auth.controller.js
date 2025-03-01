import {Router} from "express"
import * as authService from "./auth.service.js"
import * as authValidation from "./auth.validation.js"
import { validation } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";

const router = Router()

router.post(
    "/signUp",
    validation(authValidation.signUpSchema),
    asyncHandler(authService.signUp)
)
export default router