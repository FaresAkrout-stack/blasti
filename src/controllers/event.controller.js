
import ProUser from '../models/proUser.model.js'

import Event from '../models/event.model.js'; 

export const publishEvent = async (req, res) => {
  const { proUserId, eventCategorie, location, description, price, capacity, eventTime, image,video} = req.body;

  try {
  
    const proUser = await ProUser.findById(proUserId).select('+role'); 
    if (!proUser) {
      return res.status(400).json({ success: false, msg: 'ProUser not found' });
    }

    if (proUser.role !== 'proUser') {
      return res.status(401).json({ success: false, msg: 'Unauthorized action' });
    }

   
    const isExist = await Event.findOne({ proUserId, eventTime }); 
    if (isExist) {
      return res.status(400).json({ success: false, msg: 'Event already exists' });
    }

   const status= "pending";
    const newEvent = new Event({
      proUserId,
      eventCategorie,
      location,
      description,
      price,
      capacity,
      eventTime,
      image,
      video,
      status
    });

    await newEvent.save();
    

    res.status(200).json({ success: true, msg: `Event ${status} successfully`, event:newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ success: false, msg: 'Error creating event', error: err.message });
  }
};
export const viewEvent= async(req,res)=>{
  const {eventId}=req.body;
  try{
    const event=await Event.findById(eventId);
    if(!event){
      return res.status(400).json({ success: false, msg: 'Event not found'});
    }
    const EventDetails={
      event:event,
      eventCategorie:event.eventCategorie,
      location:event.location,
      description:event.description,
      price:event.price,
      capacity:event.capacity,
      eventTime:event.eventTime,
      image:event.image,
      video:event.video,
      rating:event.rating,
    }
    res.status(200).json({ success: true, msg: `Event found successfully`, EventDetails});

  }catch(err){
    res.status(500).json({success:false,msg:'error showing event details'});
  }
};


