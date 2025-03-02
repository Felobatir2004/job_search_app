import *as dbService from "../../DB/dbService.js";
import { UserModel } from "../../DB/Models/user.model.js";
import { decodedToken, tokenTypes } from "../../middlewares/auth.middleware.js";
export const updateUser = async (req,res,next)=>{
    const {firstName,lastName} = req.body;
    const {userId} = req.params
    const user = await dbService.findById({model:UserModel , id:userId})
    if(!user) return next(new Error("User not found", { cause: 404 }));

    user.firstName = firstName
    user.lastName = lastName
    user.save()

    return res.status(200).json({ success: true,date:{user}});
}

export const getLoginUserData = async (req, res, next) => {
        const { authorization } = req.headers;

        if (!authorization) {
            return next(new Error("Authorization header is missing", { cause: 401 }));
        }

        const user = await decodedToken({
            authorization,
            tokenType: tokenTypes.access,
            next
        });
      if (!user) {
        return next(new Error('User not found', { cause: 404 }));
      }

  
      res.status(200).json({
        success: true,
        data: {user},
      });
  };
  