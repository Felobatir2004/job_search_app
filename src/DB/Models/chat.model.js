import mongoose, { Schema, Types } from 'mongoose';

const chatSchema = new Schema({
  senderId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [
    {
      message: {
        type: String,
        required: true,
      },
      senderId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

chatSchema.pre('findOneAndDelete', async function (next) {
  const chat = await this.model.findOne(this.getQuery());
  if (chat) {
    console.log(`Deleting all messages from chat between sender: ${chat.senderId} and receiver: ${chat.receiverId}`);
  }
  next();
});

export const ChatModel = mongoose.models.Chat || model("Chat",chatSchema)

