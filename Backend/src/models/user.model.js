import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
const UserSchema = new Schema({
    email: {
        type:String,
        required : true,
        unique:true,
        trim:true
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    mobileNumber:{
     type:Number,
     required:true,
     unique:true,
     trim:true
    }
},{timestamps:true});

UserSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    return this.password=await bcrypt.hash(this.password,10);
})
UserSchema.methods.ispasswordcorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

UserSchema.methods.generateAccessToken =function(){
    return  jwt.sign({
        _id:this._id,
        email:this.email,
        name:this.name
    },
    process.env.AccessTokenSecret,
    {
        expiresIn:process.env.AccessTokenExpiry
    }
)
}
export const User=mongoose.model("User",UserSchema);