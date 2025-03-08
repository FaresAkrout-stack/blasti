import Admin from '../models/admin.model.js';

export const notifyAdmin = async (event) => {
  try {
   
    const admins = await Admin.find({});

   
    admins.forEach((admin) => {
      console.log(`Notifying admin ${admin.email} about pending event: ${event._id}`);
     
    });
  } catch (err) {
    console.error('Error notifying admin:', err);
  }
};