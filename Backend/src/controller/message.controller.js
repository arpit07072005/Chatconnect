 import { Message } from "../models/message.model.js";
 import { Conversation } from "../models/conversation.model.js";
 import { User } from "../models/user.model.js";
 import { io,users } from "../index.js";
 const newFriend=async(req,res)=>{
  try {
    const {email}=req.body;
    // console.log(req.user);
    const senderID=req.user._id;

    if(!email){
     return res.status(401).json({error:"please provide the email"});
    }
    const newUser= await User.findOne({email}).select("-password");
    // console.log(newUser)
    if(!newUser){
      return res.status(500).json({error:"user not registered with given email"});
    }
    const receiverID=newUser?._id;

    if (senderID.toString() === receiverID.toString()) {
  return res.status(400).json({ error: "You can't add yourself" });
}
        const participant = [senderID, receiverID].sort();
 const existing = await Conversation.findOne({
      participants: participant
    });

    if (existing) {
      return res.status(200).json({ message:"friend is already present" });
    }
    const newCon =await Conversation.create({
      participants:participant
    });
    const newConversation=await newCon.populate("participants","-password");
    const senderFormatted = {
  _id: newConversation._id,
  friend: newConversation.participants.find(
    p => p._id.toString() !== senderID.toString()
  ),
  lastMessage: "",
  lastMessageSender: null,
  updatedAt: newConversation.updatedAt
};

const receiverFormatted = {
  _id: newConversation._id,
  friend: newConversation.participants.find(
    p => p._id.toString() !== receiverID.toString()
  ),
  lastMessage: "",
  lastMessageSender: null,
  updatedAt: newConversation.updatedAt
};
    const recieverSocketId=users[receiverID.toString()];
    if(recieverSocketId){
      io.to(recieverSocketId).emit("newFriend",receiverFormatted);
    }
    const senderSocketId=users[senderID.toString()];
    if(senderSocketId){
      io.to(senderSocketId).emit("newFriend",senderFormatted);
    }
     return res.status(201).json({ message: "Friend added"});
  } catch (err) {
    console.log(err);
    return res.status(409).json({error:err});
  }
 }

 const sendMessage= async(req,res)=>{
    const {receiverID,message}=req.body;
    const senderID=req.user._id;
    try {
        const participant = [senderID, receiverID].sort();
        let conversation= await Conversation.findOne({
           participants:{$all:participant},
           $expr:{$eq:[{$size:"$participants"},2]}
        });
        if(!conversation){
            conversation= await Conversation.create({
               participants:participant
            });
        }
        const text= await Message.create({
            conversationId:conversation._id,
            sender:senderID,
            text:message
        })
        conversation.lastMessage=message;
        conversation.lastMessageSender=senderID;
        await conversation.save();
        const recieverSocketId=users[receiverID.toString()];
        if(recieverSocketId){
          io.to(recieverSocketId).emit("newMessage",text);
        }
        const senderSocketId = users[senderID.toString()];
        if (senderSocketId) {
          io.to(senderSocketId).emit("newMessage", text);
          }
        return res.status(201).json({message:text});
    } catch (err) {
        return res.status(500).json({error:err.message});
    }
 }
const getMessage = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await Message.find({conversationId})
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ data: messages });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getConversations = async (req, res) => {
  const userId = req.user._id;

  try {

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate("participants", "-password")
    .sort({ updatedAt: -1 });
    const formatted = conversations.map(conv => {
      const friend = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      return {
        _id: conv._id,
        friend,
        lastMessage: conv.lastMessage,
        lastMessageSender: conv.lastMessageSender,
        updatedAt: conv.updatedAt
      };
    });
    return res.status(200).json({ friends: formatted });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const deleteMessage=async(req,res)=>{
  const {conversationId}=req.body;
  try {
    const person= await Message.find({conversationId});
    if(person.length==0){
      return res.status(404).json({error:"No messages found"})
    }
    await Message.deleteMany({conversationId});
    const conversation = await Conversation.findById(conversationId);
    conversation.lastMessage="";
    conversation.lastMessageSender=null;
    await conversation.save();
    return res.status(200).json({message:"Messages deleted successfully"})
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
 export {sendMessage,getMessage,getConversations,newFriend,deleteMessage}