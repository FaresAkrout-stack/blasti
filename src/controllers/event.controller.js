
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

export const enrollEvent=async(req,res)=>{
  const {eventId}=req.body;
  try {
    const event=await Event.findById(eventId).select('+status');
    if (!event||event.status!=='approved') {
      return res.status(400).json({ success: false, msg: 'Event not found'});
    }
    if(event.enrollments >= event.capacity){
      return res.status(400).json({success:false,msg:'event capacity is full'});
    }
    return res.status(200).json({success:true,msg:'redirecting to paiment gateway ...'});
  } catch (error) {
    res.status(500).json({success:false,msg:'error in enrollemnt proccess'});
  }
};
export const capacityInc=async(req,res)=>{
  /* if paiment =>capacity++*/ 
}
export const updateEventDetails = async (req, res) => {
  const {
    eventId,
    proUserId,
    eventCategorie,
    location,
    description,
    price,
    capacity,
    eventTime,
    image,
    video,
  } = req.body;

  try {
    const proUser = await ProUser.findById(proUserId);
    if (!proUser) {
      return res.status(401).json({ success: false, msg: 'Unauthorized action: ProUser not found' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, msg: 'Event not found' });
    }

    
    if (event.proUserId.toString() !== proUserId) {
      return res.status(403).json({ success: false, msg: 'Unauthorized: You do not have permission to update this event' });
    }

    
    event.eventCategorie = eventCategorie ?? event.eventCategorie;
    event.location = location ?? event.location;
    event.description = description ?? event.description;
    event.price = price ?? event.price;
    event.capacity = capacity ?? event.capacity;
    event.eventTime = eventTime ?? event.eventTime;
    event.image = image ?? event.image;
    event.video = video ?? event.video;

    await event.save();

    res.status(200).json({ success: true, msg: 'Event updated successfully', data: event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, msg: 'Error updating event info', error: error.message });
  }
};
export const cancelEvent=async(req,res)=>{
  const {eventId,proUserId}=req.body;
  try {
    
    const proUser = await ProUser.findById(proUserId);
    if (!proUser) {
      return res.status(401).json({ success: false, msg: 'Unauthorized action' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, msg: 'Event not found' });
    }

    await event.deleteOne(); 

    
    res.status(200).json({ success: true, msg: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error); 
    res.status(500).json({ success: false, msg: 'Error deleting event' });
  }
}