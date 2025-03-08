import { text } from "express";
import { Double } from "mongodb";
import mongoose from "mongoose";
const eventSchema=new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true
          },
          proUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProUser', 
            required: true
          },
          reservationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reservation', 
            required: true
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
            type:text,
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

    },
    {timestamps:true},
);
const Event=mongoose.model('Event',eventSchema);
export default Event;