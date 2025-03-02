import *as dbService from "../../DB/dbService.js";
import { defaultImageCloud, defaultPublicIdCloud, roleType, UserModel } from "../../DB/Models/user.model.js";
import { decodedToken, tokenTypes } from "../../middlewares/auth.middleware.js";
import { compareHash, hash } from "../../utils/hashing/hash.js";
import cloudinary from "../../utils/fileUploading/cloudinaryConfig.js";
import mongoose from "mongoose";

export const updateUser = async (req,res,next)=>{
    const {firstName,lastName} = req.body;
    const {userId} = req.params
    const user = await dbService.findById({model:UserModel , id:userId})
    if(!user) return next(new Error("User not found", { cause: 404 }));

    user.firstName = firstName
    user.lastName = lastName
    user.updatedBy = req.user._id

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

export const getProfile = async (req, res, next) => {    
    const { userId } = req.params;

    const user = await dbService.findOne({
        model: UserModel,
        filter: { _id: userId },
        select: "firstName lastName userName mobileNumber profilePic coverPic -_id", // only userName and mobileNumber, no firstName/lastName
    });
    console.log(user.userName);
    if (!user) return next(new Error("User not found", { cause: 404 }));
    return res.status(200).json({ success: true, data: { user:{
        userName:user.userName,
        mobileNumber:user.mobileNumber,
        profilePic:user.profilePic,
        coverPic:user.coverPic
    } } });
};

export const updatePassword = async (req,res,next) =>{
    const {oldPassword , password} =req.body;

    if(!compareHash({plainText: oldPassword,hash:req.user.password}))
    return next(new Error("In-valid password",{cause:400}))

    const user= await dbService.UpdateOne({
        model:UserModel,
        filter:{_id: req.user._id},
        data:{
            password:hash({plainText:password}),
            changeCredentials:Date.now(),
            updatedBy:req.user._id
        }
    })

    return res.status(200).json({success:true,message:"password updated successfully"})

}

export const uploadProfilePic = async (req, res, next) => {
    const user = await dbService.findByIdAndUpdate({
        model:UserModel,
        id:{_id:req.user._id},
    })

    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder: `Users/${user._id}/profilePicture`,
    })
    user.profilePic = {secure_url , public_id}
    await user.save()

    return res.status(200).json({success:true,data:{user}})
};
  
  
export const uploadCover = async (req, res, next) => {
    const user = await dbService.findByIdAndUpdate({
        model:UserModel,
        id:{_id:req.user._id},
    })


    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder: `Users/${user._id}/coverPicture`,
    })
    user.coverPic = {secure_url , public_id}
    await user.save()

    return res.status(200).json({success:true,data:{user}})
};

export const deleteProfilePicture = async (req,res,next) =>{

    const user = await dbService.findByIdAndUpdate({
        model:UserModel,
        id:{_id:req.user._id},
    })

    const results = await cloudinary.uploader.destroy(user.profilePic.public_id)

    if(results.result === "ok")
    {
       user.profilePic = {
           secure_url : defaultImageCloud,
           public_id : defaultPublicIdCloud
       }
    }
    await user.save()

    return res.status(200).json({success:true,data:{user}})
}

export const deleteCoverPic = async (req,res,next) =>{

    const user = await dbService.findByIdAndUpdate({
        model:UserModel,
        id:{_id:req.user._id},
    })

    const results = await cloudinary.uploader.destroy(user.coverPic.public_id)

    if(results.result === "ok")
    {
       user.coverPic = {
           secure_url : defaultImageCloud,
           public_id : defaultPublicIdCloud
       }
    }
    await user.save()

    return res.status(200).json({success:true,data:{user}})
}

export const softDelete = async (req, res, next) => {
    const {userId} = req.params;

    const deleteuser = await dbService.findById({
        model:UserModel,
        id:{_id:userId }
    });
    if(!deleteuser) return next(new Error("user not found",{cause:404}))
    console.log(req.user._id);
    console.log(deleteuser._id);
    
    if(deleteuser._id.toString() === req.user._id.toString() ||req.user.role === roleType.Admin) 
    {
        deleteuser.isDeleted = true;
        deleteuser.deletedAt = Date.now();
        await deleteuser.save()
        return res.status(200).json({success:true , data:{deleteuser}})
    }
    else{
        return next(new Error("You are not authorized to delete this user",{cause:401}))
    }

}