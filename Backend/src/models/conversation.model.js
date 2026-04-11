import mongoose,{ Schema } from "mongoose";

const conversationSchema= new Schema({
     participants:[{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
     }],
     lastMessage:{
        type:String,
        default: ""
     },
     lastMessageSender:{
        type:Schema.Types.ObjectId,
        ref:"User"
     }

},{timestamps:true});

export const Conversation=mongoose.model("Conversation",conversationSchema);