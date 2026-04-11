import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { deleteMessage, getConversations, getMessage, newFriend, sendMessage } from "../controller/message.controller.js";

const messagerouter=Router();

messagerouter.route("/sendmessage").post(verifyjwt,sendMessage);
messagerouter.route("/get/:conversationId").get(verifyjwt,getMessage);
messagerouter.route("/getfriends").get(verifyjwt,getConversations);
messagerouter.route("/addfriends").post(verifyjwt,newFriend);
messagerouter.route("/deletemessage").post(verifyjwt,deleteMessage);





export default messagerouter