import mongoose from 'mongoose';
import User from './user.model.js';

const ProUserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  tel: {
    type: String,
    maxlength: 8,
  },
  bankAccount: {
    type: String,
    unique: true,
  },
}, {
  discriminatorKey: '__t', 
  timestamps: true, 
},
{ collection: 'prousers' },);

const ProUser = User.discriminator('ProUser', ProUserSchema);
export default ProUser;
