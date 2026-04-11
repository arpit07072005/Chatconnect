import mongoose from "mongoose";
const connectdb= async()=>{
try {
  const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_NAME}`);
  console.log(`database connected \n ${connectionInstance.connection.host}`) ;
} catch (error) {
  console.log("db not connected",error); 
  throw error; 
}
}
export default connectdb;