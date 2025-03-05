import { verifyToken } from "../../../utils/token/token.js"
import * as dbService from "../../../DB/dbService.js"
import { UserModel } from "../../../DB/Models/user.model.js"
export const tokenTypes = {
    access:"access",
    refresh:"refresh"
}


export const socketAuth = async ({
    socket,
    next,
    tokenType = tokenTypes.access,
})=>{
    
        const {authorization} = socket.handshake.auth.authorization
        const [bearer, token] = authorization.split(" ") || []
    
        if(!bearer || !token)
            return next(new Error("In-valid Token",{cause:401}))
    
        let ACCESS_SIGNATURE = undefined
        let REFRESH_SIGNATURE = undefined

    
        switch (bearer) {
            case "Admin":
                ACCESS_SIGNATURE = process.env.ADMIN_ACCESS_TOKEN
                REFRESH_SIGNATURE = process.env.ADMIN_REFRESH_TOKEN
                break;
            case "User":
                ACCESS_SIGNATURE = process.env.USER_ACCESS_TOKEN
                REFRESH_SIGNATURE = process.env.USER_REFRESH_TOKEN
                break;
            default:
                break;
        }
    
        const decoded = verifyToken({
            token , 
            signature:
             tokenType === tokenTypes.access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE
        })
        
        const user = await dbService.findOne({model:UserModel , filter: {_id:decoded.id,isDeleted:false}})
        if(!user) throw new Error("User Not Found")
        
        socket.user = user
        socket.id = user._id

        return next();
}

