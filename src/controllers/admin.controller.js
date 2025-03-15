import Admin from '../models/mongodb/admin.model.js'
import Event from '../models/mongodb/event.model.js';
import User from '../models/mongodb/user.model.js';
import ProUser from '../models/mongodb/proUser.model.js';
import { notifyProUser } from '../utils/notifyProUser.js';

export const approveEvent = async (req, res) => {
  const { eventId, status } = req.body; 

  try {
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, msg: 'Event not found' });
    }


    event.status = status;

    await event.save();


    await notifyProUser(event);

  
    res.status(200).json({ success: true, msg: `Event ${status} successfully`, event });
  } catch (err) {
    console.error('Error approving event:', err);
    res.status(500).json({ success: false, msg: 'Error approving event', error: err.message });
  }
};
export const deleteEvent = async (req, res) => {
  const { eventId, adminId } = req.body;

  try {
    
    const admin = await Admin.findById(adminId);
    if (!admin) {
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
export const bannedUser=async(req,res)=>{
  const {userId,proUserId,banDuration}=req.body;
  try {
    let user;
    if(userId){ 
      user=await User.findById(userId);
      if(!user) {
        return res.status(404).json({ success: false, msg: 'User not found'});
      }}
      else if(proUserId){
         user=await ProUser.findById(proUserId);
         if(!user) {
          return res.status(404).json({ success: false, msg: 'User not found'});
        }}
        else{
          return res.status(404).json({ success: false, msg: 'user not found'});
        }
    user.bannedUntil=new (Date.now()+banDuration);
    await user.save();
   
    res.status(200).json({success:true,msg:`user banned until ${user.bannedUntil.toISOString}`});
  } catch (error) {
    res.status(500).json({success:false,msg:'error banning user'});
  }
}
export const unbanUser=async(req,res)=>{
  const {userId,proUserId}=req.body;
  try {
    let user;
    if(userId){
       user=await User.findById(userId);
    if(!user) {
      return res.status(404).json({success:false,msg:'user not found'});
    }}
    else if(proUserId){
      user=await User.findById(proUserId);
      if(!user) {
        return res.status(404).json({success:false,msg:'user not found'});
    }}
    else{
      return res.status(404).json({success:false,msg:'user not found'});}
    user.bannedUntil=null;

    await user.save();
    res.status(200).json({success:true,msg:'user unbanned'});
  } catch (error) {
    res.status(500).json({success:false,msg:'error unbanning user'});
    
  }

};
export const fetchAllUsers=async(req,res)=>{
  try{
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(limit);
  const totalUsers = await User.countDocuments();

  res.status(200).json({
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page,
  });
} catch (error) {
  res.status(500).json({success:false, message: 'Error fetching users', error: error.message });
}}

export const fetchAllEvents=async(req,res)=>{
    try {
        const page=parseInt(req.query.page) || 1;
        const limit=parseInt(req.query.limit) || 10;
        const skip=(page-1)*limit;
        const events=await Event.find().skip(skip).limit(limit); 
        const totalEvents=await Event.countDocuments();
        res.status(200).json({
          events,
          totalEvents,
          totalPages: Math.ceil(totalEvents / limit),
    currentPage: page,
  });
          
    } catch (error) {
      res.status(500).json({success:false,msg:'error fetching events'});
    }
};
// controllers/statisticsController.js


export const systemStatistics = async (req, res) => {
  try {
   
    const totalUsers = await User.countDocuments();

   
    const totalProUsers = await ProUser.countDocuments();

  
    const proUserEvents = await Event.aggregate([
      {
        $group: {
          _id: '$proUserId', 
          totalEvents: { $sum: 1 }, 
        },
      },
      {
        $lookup: {
          from: 'prousers', 
          localField: '_id',
          foreignField: '_id',
          as: 'proUserDetails',
        },
      },
      {
        $unwind: '$proUserDetails', 
      },
      {
        $project: {
          proUserId: '$_id',
          proUserName: '$proUserDetails.username',
          totalEvents: 1,
        },
      },
    ]);

   
    const userEnrollments = await Event.aggregate([
      {
        $unwind: '$enrollments', 
      },
      {
        $group: {
          _id: '$enrollments.userId',
          totalEnrollments: { $sum: 1 }, 
        },
      },
      {
        $lookup: {
          from: 'users', 
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails', 
      },
      {
        $project: {
          userId: '$_id',
          userName: '$userDetails.username',
          totalEnrollments: 1,
        },
      },
    ]);

    res.status(200).json({
      totalUsers,
      totalProUsers,
      proUserEvents,
      userEnrollments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

