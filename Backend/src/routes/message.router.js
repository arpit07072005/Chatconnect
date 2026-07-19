import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { deleteMessage, getConversations, getMessage, newFriend, sendMessage ,resetUnread,createGroup, deleteSingleMessage} from "../controller/message.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const messagerouter=Router();

messagerouter.route("/sendmessage").post(verifyjwt,upload.single("image"),sendMessage);
messagerouter.route("/get/:conversationId").get(verifyjwt,getMessage);
messagerouter.route("/getfriends").get(verifyjwt,getConversations);
messagerouter.route("/addfriends").post(verifyjwt,newFriend);
messagerouter.route("/deletemessage").post(verifyjwt,deleteMessage);
messagerouter.route("/resetUnread").post(verifyjwt,resetUnread);
messagerouter.route("/creategroup").post(verifyjwt,createGroup);
messagerouter.delete("/deletemessage/:messageId", verifyjwt, deleteSingleMessage);






export default messagerouter