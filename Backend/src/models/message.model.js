import mongoose,{Schema} from "mongoose";

const messageSchema=new Schema({
    conversationId:{
        type:Schema.Types.ObjectId,
        ref:"Conversation",
        required:true
    },
    sender:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
        trim:true
    },
    seen:{
        type:Boolean,
        default:false
    }

},{timestamps:true})
messageSchema.index({ conversationId: 1 })
export const Message=mongoose.model("Message",messageSchema);