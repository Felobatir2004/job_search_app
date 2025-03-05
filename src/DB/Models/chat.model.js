import mongoose, { model, Schema, Types } from 'mongoose';

const messageSchema = new Schema({
  sender:{type:Types.ObjectId,ref:"User",required:true},
  receiver:{type:Types.ObjectId,ref:"User",required:true},
  message:{type:String,required:true},

},{timestamps:true})

const chatSchema = new Schema({
  users:{
    type:[{type:Types.ObjectId , ref:"User"}],
    validate:{
        validator:(value)=>{
            return value.length === 2
        },
        message:"Chat can only have 2 users"
    },
  },
  messages: [messageSchema],
}, { timestamps: true });

chatSchema.pre('findOneAndDelete', async function (next) {
  const chat = await this.model.findOne(this.getQuery());
  if (chat) {
    console.log(`Deleting all messages from chat between sender: ${chat.senderId} and receiver: ${chat.receiverId}`);
  }
  next();
});

export const ChatModel = mongoose.models.Chat || model("Chat",chatSchema)

