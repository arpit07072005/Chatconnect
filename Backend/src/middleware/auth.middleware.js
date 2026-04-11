import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const verifyjwt =async (req,res,next)=>{
    try{
    const token= req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
    if(!token){
      return  res.status(401).json({error:"Unautherised User"});
    }
    const decodedToken=jwt.verify(token,process.env.AccessTokenSecret);
    const user=await User.findById(decodedToken._id).select("-password");
    if(!user){
       return res.status(401).json({error:"Invalid access token"})
    }
    req.user=user;
    return next();
    }catch(error){
        console.error("JWT Verification Error:", error.name, error.message);
    return res.status(401).json({ error: "Invalid or Expired Token" });
    }
}