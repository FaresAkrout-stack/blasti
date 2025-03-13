import mongoose from 'mongoose'
const reservationSchema=new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required:false
          },
          proUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProUser', 
            required: false
          },
          reservationTime:{
            type:Date,
            required:true,
          }
    },
    {timestamps:true},
);
const Reservation=mongoose.model('Reservation',reservationSchema);
export default Reservation;