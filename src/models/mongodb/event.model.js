import mongoose from 'mongoose';
import { Double } from 'mongodb';
import User from './user.model.js';

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    proUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProUser',
      required: true,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
    title: {
      type: String,
    },
    earnings: {
      type: Double,
    },
    ratings: [
      {
        type: Number,
      },
    ],
    raters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    eventCategorie: {
      type: String,
      enum: ['music', 'food', 'education', 'art and culture', 'sports', 'other'],      
      required: true,
      lowercase: true,
  },
    
    location: {
      type: String,
      required: false,
    },
    description: {
      type: Object,
      required: true,
      properties: {
        generalDescription: {
          type: String,
          required: true,
        },
        whatToExpect: {
          type: String,
          required: true,
        },
        ticketIncludes: {
          type: String,
          required: true,
        },
      },
    },
    price: {
      type: Double,
    },
    capacity: {
      type: Number,
    },
    eventTime: {
      type: Date,
      required: true,
    },
    video: {
      type: String,
    },
    image: {
      type: String,
    },
    enrollments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        confirmed: {
          type: Boolean,
          default:true,
        },
        userInfo: {
          name: {
            type: String,
            required: true,
          },
          email: {
            type: String,
            required: true,
          },
          deviceType: {
            type: String,
            required: true,
          },
          location: {
            type: String,
            required: true,
          },
        },
      },
    ],
    enrollmentsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
