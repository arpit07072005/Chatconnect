import { User } from "../models/user.model.js";

const userRegister= async (req,res)=>{
   try {
    const {email,name,password,mobileNumber}=req.body;
    if(!email||!name||!password||!mobileNumber){
        return res.status(410).json({error:"please provide all the details"});
    }
     const existedUser=await User.findOne({
       $or: [{ email }, { mobileNumber }]
     });
     if(existedUser){
        return res.status(400).json({error:"User Already Exist with the given email or mobile number"});
     }
     const newUser=await User.create({
        email,name,password,mobileNumber
     })
     const createdUser=await User.findById(newUser._id).select(
        "-password"
     )
     if(!createdUser){
        return res.status(500).json({error:"something error in db during registration"});
     }
     return res.status(201).json({message:"User Registered SuccesFully"});
     } catch (error) {
      console.log(error);
   }
}
 const userLogin=async(req,res)=>{
    const {email,password}=req.body;
    if(!email ||!password){
     return res.status(405).json({error:"Please provide email and password"})
    }
    const findUser=await User.findOne({email});
    if(!findUser){
        return res.status(405).json({error:"Email is not registered"})
    }
    const verifyPassword=await findUser.ispasswordcorrect(password);
    if(!verifyPassword){
        return res.status(400).json({error:"password is incorrect"});
    }
    const accessToken=findUser.generateAccessToken();
    const option={
      httpOnly:true,
      secure:true,
      sameSite:"none",
      maxAge: 24*60*60*1000
    }
 const loggedinUser = await User.findById(findUser._id).select("-password");
    res.status(200)
    .cookie("accessToken",accessToken,option)
    .json({message:"User LoggedIn Successfully",user:loggedinUser,accessToken:accessToken});
 }
 const getUser=async(req,res)=>{
   try {
      const user=req.user;
      res.status(200).json({message:user});
   } catch (error) {
       return res.status(500).json({ error: "Server error" });
   }
 }
 const userLogout=async(req,res)=>{
   try {
    const  option={
      httpOnly:true,
      sameSite:"none",
      secure:true
      }
      return res.status(200).clearCookie('accessToken',option).json({message:"logout succesfully"});
   } catch (error) {
       return res.status(500).json({ error: "Server error" });
   }
 }
export {userRegister,userLogin,getUser,userLogout}