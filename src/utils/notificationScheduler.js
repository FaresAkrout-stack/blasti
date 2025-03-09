import { sendPushNotification } from "../lib/pushNotificationService.js";

export const scheduleNotification=(userId,msg,sendAt)=>{
    const delay =sendAt -new Date();
    if(delay>0){
        setTimeout(async() => {
            try {
                await sendPushNotification(userId,msg);
                console.log(`notfication sent to user ${userId}:${msg}`);
            } catch (error) {
                console.log("error sending notfication",error);
                
            }
        },delay)
    }
}