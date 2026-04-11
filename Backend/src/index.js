import app from "./app.js";
import connectdb from "./db/db.js";
import dotenv from "dotenv"
 dotenv.config({
    path:'./.env'
 })
connectdb()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`system is running on ${process.env.PORT}`);
    })
})
.catch((err)=>{
  console.log("db connection failed",err);
})