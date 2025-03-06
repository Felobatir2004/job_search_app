import {asyncHandler} from "../utils/error handling/asyncHandler.js"
import { verifyToken } from "../utils/token/token.js"
import * as dbService from "../DB/dbService.js"
import { UserModel } from "../DB/Models/user.model.js"
export const tokenTypes = {
    access:"access",
    refresh:"refresh"
}


export const decodedToken = async ({ authorization = "", tokenType = tokenTypes.access, next }) => {
    if (!authorization) {
        throw new Error("Authorization header missing");
    }

    const [bearer, token] = authorization.split(" ");

    if (!bearer || !token) {
        throw new Error("Bearer or token missing");
    }

    let ACCESS_SIGNATURE, REFRESH_SIGNATURE;

    switch (bearer) {
        case "Admin":
            ACCESS_SIGNATURE = process.env.ADMIN_ACCESS_TOKEN;
            REFRESH_SIGNATURE = process.env.ADMIN_REFRESH_TOKEN;
            break;
        case "User":
            ACCESS_SIGNATURE = process.env.USER_ACCESS_TOKEN;
            REFRESH_SIGNATURE = process.env.USER_REFRESH_TOKEN;
            break;
        default:
            throw new Error("Unknown bearer type");
    }

    const signature = tokenType === tokenTypes.access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE;

    console.log("Bearer:", bearer);
    console.log("Token type:", tokenType);
    console.log("Signature used:", signature);

    if (!signature) {
        throw new Error("JWT secret is missing");
    }

    let decoded;
    try {
        decoded = verifyToken({ token, signature });
        console.log("Decoded token:", decoded);
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        throw new Error(`Invalid or expired token: ${err.message}`);
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

            const user = await decodedToken({
                authorization,
                tokenType: tokenTypes.access,
            });

            if (!user) {
                throw new Error("Unauthorized");
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