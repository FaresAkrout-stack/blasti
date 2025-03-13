import User from "../models/mongodb/user.model.js"

export const  sendPushNotification=async(userId,msg)=>{
    const user=await User.findById(userId);
    if(!user||!user.deviceToken){
        throw new Error("user pr device token not found");
    }
    /* akhtar service w tw nbadalha  hethi mtaa FCM */
    const payload={
        notification:{
            title:"event Reminder",
            body:msg,

        },
        token:user.deviceToken,
    };
    await admin.messaging().send(payload);

}