import mongoose from 'mongoose'
export const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URL);
        console.log(`mongodb connection ${conn.connection.host}`);
    }catch(err){
        console.log('mongodb error', err);
    }
}