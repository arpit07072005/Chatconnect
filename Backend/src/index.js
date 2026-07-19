import dotenv from "dotenv"
dotenv.config({
   path:'./.env'
})
import app from "./app.js";
import connectdb from "./db/db.js";
import { Server } from "socket.io";
import { Message } from "./models/message.model.js";
import http from "http"
import { connectCloudinary } from "./utils/cloudinary.js";
 const server =http.createServer(app);
 const io =new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods: ["GET", "POST"],
        credentials:true
    }
 });
 connectCloudinary();
 const users={}
 io.on("connection",(socket)=>{
    socket.on("join",(userid)=>{
      users[userid]=socket.id;
        io.emit("onlineUsers", Object.keys(users));
    })
    socket.on("typing", ({ receiverId, senderName,senderId, }) => {
    const receiverSocketId = users[receiverId];

    if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderName, senderId });
    }
});
socket.on("messageDelivered", async ({ messageId, senderId }) => {
    try {

        await Message.findByIdAndUpdate(
            messageId,
            { status: "delivered" }
        );

        const senderSocketId = users[senderId];

        if (senderSocketId) {
            io.to(senderSocketId).emit(
                "messageDeliveredUpdate",
                { messageId }
            );
        }

    } catch (err) {
        console.log("Delivered Error:", err);
    }
});
socket.on("messageRead", async ({ messageId, senderId }) => {
    try {

        await Message.findByIdAndUpdate(
            messageId,
            { status: "read" }
        );

        const senderSocketId = users[senderId];

        if (senderSocketId) {
            io.to(senderSocketId).emit(
                "messageReadUpdate",
                { messageId }
            );
        }

    } catch (err) {
        console.log("Read Error:", err);
    }
});
socket.on("stopTyping", ({ receiverId, senderId }) => {
    const receiverSocketId = users[receiverId];

    if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStopTyping", { senderId });
    }
});
    socket.on("disconnect",()=>{
     for (let key in users) {
      if (users[key] === socket.id) {
        delete users[key];
            break;
      }
    }
    io.emit("onlineUsers", Object.keys(users));
 });
});
connectdb()
.then(()=>{
    server.listen(process.env.PORT,()=>{
        console.log(`system is running on ${process.env.PORT}`);
    })
})
.catch((err)=>{
  console.log("db connection failed",err);
})

export {io,users};
