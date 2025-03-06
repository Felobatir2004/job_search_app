import {asyncHandler} from "../utils/error handling/asyncHandler.js"
import { verifyToken } from "../utils/token/token.js"
import * as dbService from "../DB/dbService.js"
import { UserModel } from "../DB/Models/user.model.js"
export const tokenTypes = {
    access:"access",
    refresh:"refresh"
}


export const decodedToken = async ({ authorization = "", tokenType = tokenTypes.access }) => {
    if (!authorization.startsWith("Bearer ")) {
        throw new Error("Invalid authorization format");
    }

    const token = authorization.split(" ")[1];
    if (!token) {
        throw new Error("Token is missing");
    }
    

    const ACCESS_SIGNATURE = process.env.USER_ACCESS_TOKEN || process.env.ADMIN_ACCESS_TOKEN;
    const REFRESH_SIGNATURE = process.env.USER_REFRESH_TOKEN || process.env.ADMIN_REFRESH_TOKEN;

    if (!ACCESS_SIGNATURE || !REFRESH_SIGNATURE) {
        throw new Error("JWT secret keys are missing");
    }

    const signature = tokenType === tokenTypes.access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE;

    let decoded;
    try {
        decoded = verifyToken({ token, signature });
    } catch (err) {
        console.error("JWT verification error:", err.message);
        throw new Error("Invalid or expired token");
    }

    if (!decoded?.id) {
        throw new Error("Invalid token payload");
    }

    const user = await dbService.findOne({ model: UserModel, filter: { _id: decoded.id } });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.changeCredentials?.getTime() >= decoded.iat * 1000) {
        throw new Error("Token has been invalidated");
    }

    return user;
};


export const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({ success: false, message: "Authorization header missing" });
        }

        const user = await decodedToken({
            authorization,
            tokenType: tokenTypes.access,
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        req.user = user;
        next();
    });
};


export const allowTo = (role = [])=>{
    return asyncHandler(async(req,res,next)=>{
        if(!role.includes(req.user.role))
            return next(new Error("unauthorized",{cause:403}))
        return next()
    })
}