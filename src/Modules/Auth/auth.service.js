import * as dbService from "../../DB/dbService.js"
import { OTPType, roleType, UserModel } from "../../DB/Models/user.model.js"
import { emailEmitter } from "../../utils/email/email.event.js"
import { otp } from "../../utils/email/email.event.js"
import { compareHash, hash } from "../../utils/hashing/hash.js"
import { generateToken } from "../../utils/token/token.js"
import {OAuth2Client} from 'google-auth-library';
import {decodedToken, tokenTypes} from "../../middlewares/auth.middleware.js"
export const signUp = async  (req,res,next)=>{
    const {firstName, lastName, email , password  , gender , mobileNumber,role}= req.body

    const user = await dbService.findOne({model: UserModel , filter: {email}})
    if(user) return next (new Error("User already exists",{cause: 409}))

    const newUser = await dbService.create({
        model: UserModel,
        data:{
        firstName,
        lastName, 
        email , 
        password,
        gender,
        mobileNumber,
        OTP:[{
            OTPtype:OTPType.confirmEmail,
            code:otp,
            expiresIn:Date.now() + 5 * 60 * 1000,
        }],
        role
        },

    })
    
    emailEmitter.emit("sendEmail",email,newUser.userName,newUser._id)
    return res.status(200).json({success:true , message :"user Registered successfully", newUser})
}

export const verifyEmail = async (req, res, next) => {
    const { code, email } = req.body;

    const user = await dbService.findOne({ model: UserModel, filter: { email } });
    
    if (!user) return next(new Error("User not found", { cause: 404 }));

    if (user.confirmEmail === true) {
        return next(new Error("Email already verified", { cause: 409 }));
    }
    if (!user.OTP || user.OTP[0].OTPtype !== OTPType.confirmEmail) {
        return next(new Error("Invalid or expired OTP type", { cause: 400 }));
    }

    const currentTime = new Date();
    if (user.OTP[0].expiresAt < currentTime) {
        return next(new Error("OTP has expired", { cause: 400 }));
    }
    if(code !== user.OTP[0].code) return next(new Error("Invalid OTP code", { cause: 400 }));

    await dbService.UpdateOne({
        model: UserModel,
        filter: { email },
        data: {
            isConfirmed: true, 
        }
    });

    return res.status(200).json({ success: true, message: "Email verified successfully" });
};

export const signIn = async (req,res,next)=>{
    const {email , password} =req.body;

    const user =await dbService.findOne({model:UserModel , filter: {email}})
    if(!user) return next(new Error("user not found",{cause: 404}))
    
    if(!user.isConfirmed)
        return next (new Error("email not verified",{cause: 401}))
    
    if(!compareHash({plainText: password, hash: user.password}))
        return next (new Error("invalid password",{cause: 400}))

    const access_token = generateToken({
        payload:{id:user._id},
        signature: user.role === roleType.User
          ? process.env.USER_ACCESS_TOKEN 
          : process.env.ADMIN_ACCESS_TOKEN,
        options:{expiresIn: process.env.ACCESS_TOKEN_EXPIRESS}
    })

    const refresh_token = generateToken({
        payload:{id:user._id},
        signature: user.role === roleType.User
          ? process.env.USER_ACCESS_TOKEN 
          : process.env.ADMIN_ACCESS_TOKEN,
        options:{expiresIn: process.env.REFRESH_TOKEN_EXPIRESS}

    })
    return res.status(200).json({
        success: true,
         tokens: {
            access_token,
            refresh_token, 
         }
    })
}



export const signUpWithGoogle = async (req, res, next) => {
    const { idToken } = req.body;
    const client = new OAuth2Client();

    const verify = async () => {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,
      });
      return ticket.getPayload();
    };

    const { name, email, picture, email_verified } = await verify();

    if (!email_verified) {
      return next(new Error('Email not verified', { cause: 401 }));
    }

    let user = await dbService.findOne({ model: UserModel, filter: { email, isDeleted: false } });

    if (user && user.providers === providersTypes.System) {
      return next(new Error('User already exists with a different sign-up method', { cause: 409 }));
    }

    if (!user) {
      user = await dbService.create({
        model: UserModel,
        data: {
          userName: name,
          email,
          profilePic: { secure_url: picture }, 
          confirmEmail: email_verified,
          providers: providersTypes.Google,
          role: roleType.User, 
        },
      });
    }

    const access_token = generateToken({
      payload: { id: user._id },
      signature: process.env.USER_ACCESS_TOKEN,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRESS },
    });

    const refresh_token = generateToken({
      payload: { id: user._id },
      signature: process.env.USER_ACCESS_TOKEN,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRESS },
    });

    return res.status(200).json({
      success: true,
      tokens: {
        access_token,
        refresh_token,
      },
    });

};

export const loginWithGoogle = async (req,res,next)=>{

    const {idToken} = req.body;
    const client = new OAuth2Client();
    async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    return payload;
    }
    const {name , email, picture, email_verified}= await verify();

    if(!email_verified)
        return next(new Error("email not verified",{cause: 401}))
    let user = await dbService.findOne({model:UserModel , filter: {email,isDeleted:false}})

    if(user?.providers === providersTypes.System)
        return next(new Error("User Already Exist",{cause:409}))
    if(!user)
    {
        user = await dbService.create({
            model: UserModel,
            data:{
                userName: name,
                email,
                image: picture,
                confirmEmail: email_verified,
                providers: providersTypes.Google
            }
        })
    };
    
    const access_token = generateToken({
        payload:{id:user._id},
        signature: user.role === roleType.User
          ? process.env.USER_ACCESS_TOKEN 
          : process.env.ADMIN_ACCESS_TOKEN,
        options:{expiresIn: process.env.ACCESS_TOKEN_EXPIRESS}
    })

    const refresh_token = generateToken({
        payload:{id:user._id},
        signature: user.role === roleType.User
          ? process.env.USER_ACCESS_TOKEN 
          : process.env.ADMIN_ACCESS_TOKEN,
        options:{expiresIn: process.env.REFRESH_TOKEN_EXPIRESS}

    })
    return res.status(200).json({
        success:true,
        tokens: {
            access_token,
            refresh_token, 
        }
    })
    
}

export const forget_password = async (req,res,next)=>{

    const { email } =req.body

    const user = await dbService.findOne({model:UserModel , filter: {email}})
    if(!user) return next(new Error("User Not Found", {cause: 404}))
    
    const updateUser = await dbService.UpdateOne({
        model:UserModel,
        filter:{email},
        data:{
            OTP:[{
                OTPtype:OTPType.forgetPassword,
                code:otp,
                expiresIn:Date.now() + 5 * 60 * 1000,
            }]
        }
    })
    emailEmitter.emit("forgetPasssword",email,user.userName,user._id)
    return res.status(200).json({
        success: true,
        message:"email sent successfully"
    })
}

export const reset_password = async (req,res,next)=>{

    const {email , password , code} = req.body

    const user = await dbService.findOne({model:UserModel , filter: {email}})
    if(!user) return next(new Error("User Not Found", {cause: 404}))

    if(!user.OTP || user.OTP[0].OTPtype !== OTPType.forgetPassword) {
        return next(new Error("Invalid or expired OTP type", { cause: 400 }));
    }

    const currentTime = new Date();
    if (user.OTP[0].expiresAt < currentTime) {
        return next(new Error("OTP has expired", { cause: 400 }));
    }

    if(code !== user.OTP[0].code) return next(new Error("Invalid OTP code", { cause: 400 }));

    await dbService.UpdateOne({
        model:UserModel,
        filter:{email},
        data:{
            password:hash({plainText:password}),
            $unset:{OTP:""}
        }
    })    
    return res.status(200).json({
        success: true,
        message:"password updated successfully"
    })
}

export const refresh_token = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        console.log(authorization);
        if (!authorization) {
            return res.status(401).json({ success: false, message: "Authorization header missing" });
        }

        const user = await decodedToken({
            authorization,
            tokenType: tokenTypes.refresh,
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
        }

        const access_token = generateToken({
            payload: { id: user._id },
            signature: user.role === roleType.User
                ? process.env.USER_ACCESS_TOKEN
                : process.env.ADMIN_ACCESS_TOKEN,
        });

        const refresh_token = generateToken({
            payload: { id: user._id },
            signature: user.role === roleType.User
                ? process.env.USER_REFRESH_TOKEN
                : process.env.ADMIN_REFRESH_TOKEN,
        });

        return res.status(200).json({
            success: true,
            tokens: { access_token, refresh_token }
        });

    } catch (err) {
        next(err); // Pass errors to Express error handler
    }
};
