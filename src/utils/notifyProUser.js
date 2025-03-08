import ProUser from '../models/proUser.model.js';

export const notifyProUser = async (event) => {
  try {
   
    const proUser = await ProUser.findById(event.proUserId);

  
    console.log(`Notifying ProUser ${proUser.email} about event status: ${event.status}`);
    
  } catch (err) {
    console.error('Error notifying ProUser:', err);
  }
};