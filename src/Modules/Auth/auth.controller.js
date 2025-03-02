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
router.patch(
    "/confirmOtp",
    validation(authValidation.confirmEmailSchema),
    asyncHandler(authService.verifyEmail)
)

router.post(
    "/signIn",
    validation(authValidation.signInSchema),
    asyncHandler(authService.signIn)
)

router.patch(
    "/forget_password",
    validation(authValidation.forgetPasswordSchema),
    asyncHandler(authService.forget_password)
)

router.patch(
    "/reset_password",
    validation(authValidation.resetPasswordSchema),
    asyncHandler(authService.reset_password)
)

router.get(
    "/refresh_token",
    asyncHandler(authService.refresh_token)
)
export default router