import app from "./app.js";
import connectdb from "./db/db.js";
import dotenv from "dotenv"
import { Server } from "socket.io";
import http from "http"
 dotenv.config({
    path:'./.env'
 })
 const server =http.createServer(app);
 const io =new Server(server,{
    cors:{
        origin:"https://chatconnect-ten.vercel.app",
        methods: ["GET", "POST"],
        credentials:true
    }
 });
 const users={}
 io.on("connection",(socket)=>{
    console.log(`user socket id is ${socket.id}`);
    socket.on("join",(userid)=>{
      users[userid]=socket.id;
      console.log("users",users);
    })
    socket.on("disconnect",()=>{
     for (let key in users) {
      if (users[key] === socket.id) {
        delete users[key];
      }
    }
    console.log("User disconnected");
    })
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
