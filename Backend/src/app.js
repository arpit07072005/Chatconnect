import express from "express"
import router from "./routes/user.router.js";
import messagerouter from "./routes/message.router.js";
import cors from 'cors'
import cookieParser from "cookie-parser";
const app =express();
 app.use(cors({
     origin:'https://chatconnect-ten.vercel.app',
     credentials: true
 }))
 app.set("trust proxy",1)
 app.use(cookieParser());
app.use(express.json())
app.use("/api/u",router);
app.use("/api/message",messagerouter)

export default app;