import User from "../models/user.model.js";
import ProUser from "../models/proUser.model.js";
export const checkBan=async(req,res,next)=>{
    const {userId,proUserId}=req.body;
    try {
        let user;
        if (userId) {
             user=await User.findById(userId);
            if(!user){
                return res.status(404).json({success:false,msg:'user not found'});
        }}
        if(proUserId){
            user=await ProUser.findById(proUserId);
            if(!user){
                return res.status(404).json({success:false,msg:'pro user not found'});}
        }

        if(user.bannedUntil&& user.bannedUntil>new Date()){
            return res.status(403).json({success:false,msg:`you are banned until ${user.bannedUntil.toISOString}`});
        }
        next();
    } catch (error) {
        console.log('error checking ban',error);
        return res.status(500).json({success:false,msg:'error checking ban'});
        
    }
} ;