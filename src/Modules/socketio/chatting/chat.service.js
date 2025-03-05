import ChatModel from "../../../DB/Models/chat.model.js";
import { UserModel } from "../../../DB/Models/user.model.js";
import * as dbService from "../../../DB/dbService.js"
export const sendMessage = function (socket,io) {
    return async ({message ,from, to})=>{
 
        const friendId = to
        const companyId = from
        const {message} = req.body
        const friend = await dbService.findOne({model:UserModel , filter:{_id:friendId }})
        if(!friend) 
            throw new Error("friend Not Found")
        
        const company = await dbService.findById({
            model: CompanyModel,
            id: companyId,
            options: { populate: "HRs" } 
        });
        
        if (!company) {
            throw new Error("Company not found");
        }
        
        const isHR = company.HRs.some(hr => hr._id?.toString() === socket.user._id?.toString());
        if ( !isHR) {
            throw new Error("You are not HR to send a message");
        }
    
        let chat = await dbService.findOne({
            model:ChatModel ,
            filter:{users:{$all:[ socket.user._id, friend._id]} }})
        if(!chat) {
            chat = await dbService.create({
                model:ChatModel , 
                data:{
                    users:[req.user._id , friendId],
                    messages:[{sender:socket.user._id ,receiver:friendId, message}]
                }
            })
        }else{
            chat.messages.push({sender:socket.user._id,receiver:friendId , message})
            await chat.save()
        }
    
        let chatpopulated = await dbService.findOne({
            model:ChatModel ,
            filter:{_id:chat._id},
            populate:[{path:"users"}]
        })
        socket.to(friendId).emit("newMessage", {content, from: socket.id})
        
    
    }
}

