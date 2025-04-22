import User from "../models/mongodb/user.model.js";
import ProUser from "../models/mongodb/proUser.model.js";

export const checkBan = async (req, res, next) => {
  const { userId, proUserId } = req.body;

  try {
    let user = null;

    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, msg: 'User not found' });
      }
    } else if (proUserId) {
      user = await ProUser.findById(proUserId);
      if (!user) {
        return res.status(404).json({ success: false, msg: 'Pro user not found' });
      }
    } else {
      return res.status(400).json({ success: false, msg: 'User ID or Pro User ID is required' });
    }

    if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        msg: `You are banned until ${new Date(user.bannedUntil).toISOString()}`,
      });
    }

    next();
  } catch (error) {
    console.log('Error checking ban:', error);
    return res.status(500).json({ success: false, msg: 'Error checking ban' });
  }
};
