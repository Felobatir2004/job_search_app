import * as dbService from "../../DB/dbService.js"
import {ChatModel} from "../../DB/Models/chat.model.js";
import { CompanyModel } from "../../DB/Models/company.model.js";
import { UserModel } from "../../DB/Models/user.model.js";
export const getChatHistory = async (req, res, next) => {
      const { friendId } = req.params;
  
      const friend = await dbService.findOne({ model: UserModel, filter: { _id: friendId } });
      if (!friend) {
        return next(new Error("Friend not found", { cause: 404 }));
      }
  
      const chat = await dbService.findOne({
        model: ChatModel,
        filter: { users: { $all: [req.user._id, friend._id] } },
        populate: [{ path: "users" }]
      });
  
      if (!chat) {
        return res.status(200).json({ success: true, results: [] }); // No chat yet
      }
  
      return res.status(200).json({ success: true, results: chat.messages });
  

  };
  



export const sendMessage = async (req , res , next) =>{
    const {companyId,friendId } = req.params;  
    const {message} = req.body
    const friend = await dbService.findOne({model:UserModel , filter:{_id:friendId }})
    if(!friend) 
        return next(new Error("friend Not Found",{cause:404}))
    
    const company = await dbService.findById({
        model: CompanyModel,
        id: companyId,
        options: { populate: "HRs" } 
    });
    
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }
    
    const isHR = company.HRs.some(hr => hr._id?.toString() === req.user._id?.toString());
    if ( !isHR) {
        return next(new Error("You are not HR to send a message", { cause: 403 }));
    }

    let chat = await dbService.findOne({
        model:ChatModel ,
        filter:{users:{$all:[ req.user._id, friend._id]} }})
    if(!chat) {
        chat = await dbService.create({
            model:ChatModel , 
            data:{
                users:[req.user._id , friendId],
                messages:[{sender:req.user._id ,receiver:friendId, message}]
            }
        })
    }else{
        chat.messages.push({sender:req.user._id,receiver:friendId , message})
        await chat.save()
    }

    let chatpopulated = await dbService.findOne({
        model:ChatModel ,
        filter:{_id:chat._id},
        populate:[{path:"users"}]
    })
    return res.status(200).json({success:true , results: {chatpopulated}})
    

}

