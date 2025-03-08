import { text } from "express";
import { Double } from "mongodb";
import mongoose from "mongoose";
const eventSchema=new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            
          },
          proUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProUser', 
            required: true
          },
          reservationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reservation', 
            
          },
          earnings:{
            type:Double,

          },
          rating:{
            type:Double,
          },
          eventCategorie:{
            type:String,
            required:true,
          },
          location:{
            type:String,
            required:true,
          },
          description:{
            type:String,
            required:true,

          },
          price:{
            type:Double,
          },
          capacity:{
            type:Number,
          },
          eventTime:{
            type:Date,
            required:true,
          },
          video: {
            type: String,
          },
          image: {
            type: String, 
          },
          status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending", 
          },

    },
    {timestamps:true},
);
const Event=mongoose.model('Event',eventSchema);
export default Event;