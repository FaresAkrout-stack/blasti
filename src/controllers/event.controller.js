
import ProUser from '../models/mongodb/proUser.model.js'

import Event from '../models/mongodb/event.model.js'; 
import User from '../models/mongodb/user.model.js';
//import { generateEventDetails, generateEventImage } from '../utils/openaiClient.js';



export const publishEvent = async (req, res) => {
  try {
    const proUserId = req.params.proUserId; // ← grab from params

    // Verify user exists and is a proUser
    const user = await User.findById(proUserId);
    if (!user || user.role !== 'proUser') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Create new event
    const event = new Event({
      proUserId, // make sure your Event model has `proUserId`
      title: req.body.title,
      eventCategorie: req.body.eventCategorie,
      location: req.body.location,
      price: req.body.price,
      capacity: req.body.capacity,
      eventTime: req.body.eventTime,
      description: `${req.body.generalDescription}\n\nWhat to expect: ${req.body.whatToExpect}\n\nTicket includes: ${req.body.ticketIncludes}`,
      image: req.files?.image?.[0]?.filename || null,
      video: req.files?.video?.[0]?.filename || null,
      status: 'pending'
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event
    });

  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const enrollEvent = async (req, res) => {
  const { eventId, userName, userEmail, location } = req.body;  // Get eventId, userName, userEmail, and optional location from request body
  const { userId } = req.params;  // Get userId from URL params

  // Validate input
  if (!userName || !userEmail || !eventId) {
    return res.status(400).json({ success: false, msg: 'Name, email, and event ID are required' });
  }

  try {
    // Find the event by ID and check its status
    const event = await Event.findById(eventId).select('+status');
    if (!event || event.status !== 'approved') {
      return res.status(400).json({ success: false, msg: 'Event not found or not approved' });
    }

    // Check if user is already enrolled
    const alreadyEnrolled = event.enrollments.some(enrollment => enrollment.userId.toString() === userId);
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, msg: 'User is already enrolled in this event' });
    }

    // Check event capacity
    if (event.enrollmentsCount >= event.capacity) {
      return res.status(400).json({ success: false, msg: 'Event capacity is full' });
    }

    // Create a new enrollment object (confirmed is set to true)
    const newEnrollment = {
      userId,
      confirmed: true,  // ✅ mark as confirmed upon enrollment
      userInfo: {
        name: userName,
        email: userEmail,
        deviceType: req.headers['user-agent'],
        location: location || 'unknown',
      },
    };

    // Add the new enrollment to the event's enrollments array
    event.enrollments.push(newEnrollment);
    event.enrollmentsCount += 1;

    // Save the event with the updated enrollments
    await event.save();

    return res.status(200).json({ success: true, msg: 'Enrollment successful and confirmed' });
  } catch (error) {
    console.error('Error during enrollment process:', error);
    return res.status(500).json({ success: false, msg: 'Error in enrollment process' });
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
};
export const calculateRevenue=async(req,res)=>{
  const {eventId}=req.body;
  try {
    const event=await Event.findById(eventId).select('+earnings');
    if(!event){
      return res.status(400).json({success:false,msg:'event not found'});
    }
    const revenue=event.price*event.enrollmentsCount;
    event.earnings+=revenue;
    await event.save();
    res.status(200).json({success:true,msg:'Revenue calculated successfully',data:`${revenue} DT`});
  } catch (error) {
    res.status(500).json({success:false,msg:'error calculating revenue'});
    
  }  
};
export const showRating = async (req, res) => {
  const { eventId } = req.body;

  try {
      const event = await Event.findById(eventId);
      if (!event) {
          return res.status(404).json({success: false,message:"Event not found" });
      }

      const totalRatings = event.ratings.reduce((sum,rating) => sum + rating, 0);
      const averageRating = event.ratings.length>0 ? totalRatings / event.ratings.length : 0;

      res.status(200).json({
          success: true,
          message: "Rating fetched successfully",
          data: averageRating,
      });

  } catch (error) {
      console.error("Error showing ratings:", error);
      res.status(500).json({success: false,message:"Error showing ratings" });
  }
};
/*export const createEventWithAI = async (req, res) => {
  const { userPrompt,userId } = req.body; 

  try {
      
    
      const aiResponse = await generateEventDetails(
          `Generate a creative event based on the following input: ${userPrompt}. 
          Include a title, description, location, and category.`
      );

      
      const eventDetails = JSON.parse(aiResponse);

    
      const imagePrompt = `A vibrant and creative image for an event titled "${eventDetails.title}". 
                          The event is a ${eventDetails.category} taking place in ${eventDetails.location}. 
                          The image should capture the essence of the event: ${eventDetails.description}.`;
      const imageUrl = await generateEventImage(imagePrompt);

      
      const event = new Event({
          title: eventDetails.title,
          description: eventDetails.description,
          location: eventDetails.location,
          eventCategorie: eventDetails.category,
          proUserId: req.user._id, 
          eventTime: new Date(), 
          capacity: 100, 
          price: 0, 
          image: imageUrl, 
      });

    
      await event.save();

      res.status(201).json({ success: true, message: "Event created successfully", event });
  } catch (error) {
      console.error("Error creating event with AI:", error);
      res.status(500).json({ success: false, message: "Error creating event with AI" });
  }
};*/
// Filename: analytics.controller.js

export const getAnalyticsStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await Event.find({ proUserId: userId });

    const totalEvents = events.length;
    const totalRevenue = events.reduce((sum, event) => sum + (event.earnings || 0), 0);

    const allRatings = events.flatMap(event => event.ratings || []);
    const averageRating = allRatings.length > 0
      ? (allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(2)
      : null;

    const categoryCounts = events.reduce((acc, event) => {
      acc[event.eventCategorie] = (acc[event.eventCategorie] || 0) + 1;
      return acc;
    }, {});
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const deviceCounts = {};
    events.forEach(event => {
      event.enrollments?.forEach(enroll => {
        const device = enroll.userInfo?.deviceType;
        if (device) {
          deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        }
      });
    });
    const deviceDistribution = Object.entries(deviceCounts).map(([device, count]) => ({ device, count }));

    const totalEnrollments = events.reduce((sum, event) => sum + (event.enrollments?.length || 0), 0);
    const totalCapacity = events.reduce((sum, event) => sum + (event.capacity || 0), 0);
    const averageCapacity = totalEvents > 0 ? (totalCapacity / totalEvents).toFixed(1) : null;

    const statusCount = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      totalEvents,
      totalRevenue,
      averageRating,
      totalEnrollments,
      averageCapacity,
      topCategories,
      deviceDistribution,
      statusCount,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
};


export const getTopRatedCategories = async (req, res) => {
  try {
    const categories = await Event.aggregate([
      {
        $group: {
          _id: '$eventCategorie',
        },
      },
      {
        $sort: { _id: 1 }, // Sorting alphabetically or by any other logic if necessary
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
        },
      },
    ]);

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

export const getTopRatedEvents = async (req, res) => {
  try {
    const events = await Event.find().limit(6); // remove .sort() for now

    // Add average rating to each event
    const ratedEvents = events.map(event => {
      const ratingsArray = event.ratings || [];
      const total = ratingsArray.reduce((sum, r) => sum + r, 0);
      const avg = ratingsArray.length > 0 ? total / ratingsArray.length : 0;

      return {
        ...event._doc,
        averageRating: avg
      };
    });

    // Now sort by the computed averageRating
    const sorted = ratedEvents.sort((a, b) => b.averageRating - a.averageRating).slice(0, 6);

    res.status(200).json(sorted);
  } catch (error) {
    console.error('Error fetching top-rated events:', error);
    res.status(500).json({ message: 'Error fetching top-rated events', error });
  }
};

export const getEventDetails = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, msg: 'Event not found' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`; // e.g. http://localhost:8000

    // Calculate average rating
    const ratings = event.ratings || [];
    const total = ratings.reduce((sum, r) => sum + r, 0);
    const averageRating = ratings.length > 0 ? total / ratings.length : 0;

    // Parse description
    const rawDescription = event.description || '';
    const [intro, ...rest] = rawDescription.split(/What to expect:|What to Expect:/i);
    const [expectation, ticketPart] = rest.length ? rest[0].split(/Ticket includes:|Ticket Includes:/i) : ['', ''];
    const ticketIncludes = ticketPart
      ? ticketPart.split(',').map(item => item.trim()).filter(Boolean)
      : [];

    // Prepare response
    const eventWithMediaPaths = {
      ...event._doc,
      image: event.image && event.image !== 'false' ? `${baseUrl}/uploads/${event.image}` : null,
      video: event.video && event.video !== 'false' ? `${baseUrl}/uploads/${event.video}` : null,
      videos: Array.isArray(event.videos)
        ? event.videos.map(v => v && v !== 'false' ? `${baseUrl}/uploads/${v}` : null).filter(v => v !== null)
        : [],
      averageRating,
      descriptionParsed: {
        intro: intro.trim(),
        expectation: expectation.trim(),
        ticketIncludes,
      },
    };

    res.status(200).json({
      success: true,
      msg: 'Event details fetched successfully',
      event: eventWithMediaPaths,
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({
      success: false,
      msg: 'Error fetching event details',
      error: error.message,
    });
  }
};
export const getEventsByCategory = async (req, res) => {
  const { category } = req.params;

  // Check if the category is valid
  const validCategories = ['music', 'food', 'education', 'art and culture', 'sports', 'other'];
  
  if (!validCategories.includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }

  try {
    const events = await Event.find({
      eventCategorie: category,
      status: 'approved',
    }).populate('userId proUserId reservationId raters');

    if (events.length === 0) {
      return res.status(404).json({ message: `No events found for the category ${category}.` });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events by category:', error);
    res.status(500).json({ message: 'Failed to fetch events by category' });
  }
};
export const getFilteredEvents = async (req, res) => {
  try {
    const { location, eventCategorie, priceFrom, priceTo } = req.query;
    const filter = { status: 'approved' };

    // only add category if provided
    if (eventCategorie) {
      filter.eventCategorie = new RegExp(`^${eventCategorie.trim()}$`, 'i');
    }

    // only add location if provided
    if (location) {
      filter.location = new RegExp(location.trim(), 'i');
    }

    // only add price range if one or both bounds provided
    if (priceFrom || priceTo) {
      filter.price = {};
      if (priceFrom) filter.price.$gte = Number(priceFrom);
      if (priceTo)   filter.price.$lte = Number(priceTo);
    }

    console.log('FINAL FILTER:', JSON.stringify(filter, null, 2));

    const events = await Event.find(filter)
      .populate('proUserId', 'userName email')
      .select('title eventCategorie location price image averageRating eventTime description ratings')
      .lean();

    const eventsWithDetails = events.map(evt => {
      let avg = evt.averageRating;
      if ((!avg || avg === 0) && evt.ratings?.length) {
        avg = evt.ratings.reduce((a,b) => a + b, 0) / evt.ratings.length;
      }
      return {
        _id: evt._id,
        title: evt.title,
        category: evt.eventCategorie,
        location: evt.location,
        price: evt.price,
        image: evt.image,
        averageRating: avg ? Number(avg.toFixed(1)) : 0,
        date: evt.eventTime,
        description: evt.description?.generalDescription || '',
        organizer: evt.proUserId?.userName || 'Unknown'
      };
    });

    return res.status(200).json({ success: true, events: eventsWithDetails });
  } catch (err) {
    console.error('SERVER ERROR:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: 'Server error while processing request'
    });
  }
};
