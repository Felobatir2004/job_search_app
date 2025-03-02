import {Router} from "express"
import * as userService from "./user.service.js"
import * as userValidation from "./user.validation.js"
import { validation } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
import { fileValidation, uploadCloud } from "../../utils/fileUploading/multerCloud.js";

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

router.get(
    "/:userId",
    authentication(),
    validation(userValidation.getProfileSchema),
    asyncHandler(userService.getProfile)
)

router.patch(
    "/updatePassword",
    validation(userValidation.updatePasswordSchema),
    authentication(),
    asyncHandler(userService.updatePassword)
)

router.post(
    "/uploadprofileImage",
    authentication(),
    uploadCloud().single("image"),
    asyncHandler(userService.uploadProfilePic)
)

router.post(
    "/uploadCoverImage",
    authentication(),
    uploadCloud().single("image"),
    asyncHandler(userService.uploadCover)
)
router.delete(
    "/deleteProfilePicture", 
    authentication(),
    uploadCloud().single("image"),
    asyncHandler(userService.deleteProfilePicture)
)

router.delete(
    "/deleteCoverPicture", 
    authentication(),
    uploadCloud().single("image"),
    asyncHandler(userService.deleteCoverPic)
)

router.patch(
    "/softDelete/:userId",
    authentication(),
    validation(userValidation.softDeleteSchema),
    asyncHandler(userService.softDelete)
)
export default router