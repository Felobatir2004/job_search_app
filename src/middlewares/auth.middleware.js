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
        return next(new Error("Invalid Token: Authorization header missing", { cause: 401 }));
    }

    const [bearer, token] = authorization.split(" ");

    if (!bearer || !token) {
        return next(new Error("Invalid Token: Bearer or token missing", { cause: 401 }));
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
            return next(new Error("Invalid Token: Unknown bearer type", { cause: 401 }));
    }

    const signature = tokenType === tokenTypes.access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE;

    let decoded;
    try {
        decoded = verifyToken({ token, signature });
    } catch (err) {
        return next(new Error("Invalid Token: JWT verification failed", { cause: 401 }));
    }

    const user = await dbService.findOne({ model: UserModel, filter: { _id: decoded.id } });

    if (!user) {
        return next(new Error("User Not Found", { cause: 404 }));
    }

    if (user.changeCredentials?.getTime() >= decoded.iat * 1000) {
        return next(new Error("Invalid Token: Token has been invalidated", { cause: 400 }));
    }

    return user;
};

export const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        const { authorization } = req.headers;

        const user = await decodedToken({
            authorization,
            tokenType: tokenTypes.access,
            next,
        });

        if (!user) {
            return next(new Error("Unauthorized", { cause: 401 }));
        }

        req.user = user;

        return next();
    });
};

export const allowTo = (role = [])=>{
    return asyncHandler(async(req,res,next)=>{
        if(!role.includes(req.user.role))
            return next(new Error("unauthorized",{cause:403}))
        return next()
    })
}