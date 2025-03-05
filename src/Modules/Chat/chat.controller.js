import { Router } from "express";
import {authentication} from "../../middlewares/auth.middleware.js"
import * as chatService from "./chat.service.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import * as chatValidation from "./chat.validation.js"
import { validation } from "../../middlewares/validation.middleware.js";
const router = Router()

router.get(
    "/:friendId",
    authentication(),
    validation(chatValidation.getChatSchema),
    asyncHandler(chatService.getChatHistory)
)

router.post(
    "/:companyId/message/:friendId",
    authentication(),
    validation(chatValidation.sendMessageSchema),
    asyncHandler(chatService.sendMessage)
)
export default router

