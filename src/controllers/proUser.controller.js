// services/eventService.js

import Event from '../models/mongodb/event.model.js';
import mongoose from 'mongoose';

// Function to fetch the event data

export const fetchEventDashboardData = async (req, res) => {
  try {
    const proUserId = req.params.proUserId;

    // Log when a request is made
    console.log(`Request made at: ${new Date().toISOString()}`);
    console.log(`Fetching event data for proUserId: ${proUserId}`);

    // Validate proUserId
    if (!mongoose.Types.ObjectId.isValid(proUserId)) {
      return res.status(400).json({ message: "Invalid proUserId format" });
    }

    // Fetch events with population of related data
    const eventData = await Event.find({ proUserId })
      .populate('enrollments.userId', 'name email profilePic')
      .lean();

    if (!eventData || eventData.length === 0) {
      return res.status(200).json({ 
        eventData: [], 
        stats: {
          totalEvents: 0,
          upcomingEvents: 0,
          totalParticipants: 0,
          categories: 0
        } 
      });
    }

    // Calculate statistics
    const totalEvents = eventData.length;
    const upcomingEvents = eventData.filter(event => 
      new Date(event.eventTime) > new Date()
    ).length;
    
    const totalParticipants = eventData.reduce(
      (acc, event) => acc + (event.enrollments?.length || 0), 
      0
    );
    
    const categories = new Set(
      eventData.map(event => event.eventCategorie)
    ).size;

    // Transform event data for frontend
    const transformedEvents = eventData.map(event => ({
      id: event._id,
      title: event.title,
      category: event.eventCategorie,
      date: event.eventTime ? formatDate(event.eventTime) : 'N/A',
      time: event.eventTime ? formatTime(event.eventTime) : 'N/A',
      image: event.image || '/default-event.jpg',
      status: event.status || 'pending',
      participants: event.enrollments?.map(enrollment => ({
        id: enrollment.userId?._id || null,
        name: enrollment.userInfo?.name || 'Anonymous',
        email: enrollment.userInfo?.email || 'No email',
        profilePic: enrollment.userInfo?.profilePic || '/default-profile.jpg'
      })) || []
    }));

    const stats = {
      totalEvents,
      upcomingEvents,
      totalParticipants,
      categories
    };

    res.json({ 
      eventData: transformedEvents, 
      stats 
    });

  } catch (error) {
    console.error("Error fetching event data:", error);
    res.status(500).json({ 
      message: "Error fetching event data",
      error: error.message 
    });
  }
};

// Helper functions
function formatDate(date) {
  const options = { month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}

function formatTime(date) {
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleTimeString('en-US', options);
}
// Update Event by ID
export const updateEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedData, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};

// Delete Event by ID
export const deleteEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const deleted = await Event.findByIdAndDelete(eventId);

    if (!deleted) {
      return res.status(404).json({ message: "Event not found or already deleted" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
};
export const fetchEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId format" });
    }

    // Fetch the event by eventId
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ event });

  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      message: "Error fetching event",
      error: error.message
    });
  }
};
export const getAnalyticsStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate the userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }
    
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Fetch events for the user with necessary fields only
    const events = await Event.find({ proUserId: userObjectId })
      .select('earnings ratings eventCategorie capacity enrollments status price createdAt eventTime');

    if (events.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No events found for this user",
        stats: {
          basic: {
            totalEvents: 0,
            activeEvents: 0,
            upcomingEvents: 0,
            pastEvents: 0,
            recentEvents: 0
          },
          financial: {
            totalRevenue: 0,
            averageRevenuePerEvent: 0,
            highestPricedEvent: 0,
            estimatedFutureRevenue: 0
          },
          engagement: {
            totalEnrollments: 0,
            averageEnrollmentsPerEvent: 0,
            enrollmentRate: 0,
            averageRating: null
          },
          categories: {
            topCategories: [],
            categoryRevenue: {}
          },
          timeAnalysis: {
            eventsPerMonth: {},
            bestPerformingMonth: null
          },
          statusDistribution: {}
        }
      });
    }

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Calculate total capacity for all events
    const totalCapacity = events.reduce((sum, event) => sum + (event.capacity || 0), 0);

    // Basic stats
    const pastEvents = events.filter(event => event.eventTime < now).length;
    const upcomingEvents = events.filter(event => event.eventTime >= now).length;
    const activeEvents = events.filter(event => 
      event.status === 'approved' && event.eventTime >= now
    ).length;
    const recentEvents = events.filter(event => event.createdAt >= oneMonthAgo).length;

    // Financial stats
    const totalRevenue = events.reduce((sum, event) => sum + (event.earnings || 0), 0);
    const averageRevenuePerEvent = totalRevenue / events.length;
    const highestPricedEvent = Math.max(...events.map(event => event.price || 0));
    
    // Calculate estimated future revenue from upcoming approved events
    const estimatedFutureRevenue = events
      .filter(event => event.status === 'approved' && event.eventTime >= now)
      .reduce((sum, event) => sum + (event.price * (event.capacity || 0) * 0.7), 0); // Assuming 70% capacity

    // Engagement stats
    const totalEnrollments = events.reduce((sum, event) => sum + (event.enrollments?.length || 0), 0);
    const averageEnrollmentsPerEvent = totalEnrollments / events.length;
    const enrollmentRate = totalCapacity > 0 
      ? (totalEnrollments / totalCapacity) * 100 
      : 0;
    
    // Rating stats
    const allRatings = events.flatMap(event => event.ratings || []);
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : null;

    // Category analysis
    const categoryStats = events.reduce((acc, event) => {
      if (event.eventCategorie) {
        if (!acc[event.eventCategorie]) {
          acc[event.eventCategorie] = {
            count: 0,
            revenue: 0,
            enrollments: 0
          };
        }
        acc[event.eventCategorie].count++;
        acc[event.eventCategorie].revenue += event.earnings || 0;
        acc[event.eventCategorie].enrollments += event.enrollments?.length || 0;
      }
      return acc;
    }, {});

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ 
        category, 
        eventCount: stats.count,
        revenue: stats.revenue,
        popularity: stats.enrollments
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 5);

    // Time-based analysis
    const eventsPerMonth = events.reduce((acc, event) => {
      const monthYear = event.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    const bestPerformingMonth = Object.entries(eventsPerMonth)
      .sort((a, b) => b[1] - a[1])
      .map(([month]) => month)[0] || null;

    // Status counts
    const statusDistribution = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      stats: {
        basic: {
          totalEvents: events.length,
          activeEvents,
          upcomingEvents,
          pastEvents,
          recentEvents
        },
        financial: {
          totalRevenue,
          averageRevenuePerEvent,
          highestPricedEvent,
          estimatedFutureRevenue
        },
        engagement: {
          totalEnrollments,
          averageEnrollmentsPerEvent,
          enrollmentRate,
          averageRating
        },
        categories: {
          topCategories,
          categoryRevenue: Object.fromEntries(
            Object.entries(categoryStats).map(([cat, stats]) => [cat, stats.revenue])
          )
        },
        timeAnalysis: {
          eventsPerMonth,
          bestPerformingMonth
        },
        statusDistribution
      }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get analytics',
      error: error.message 
    });
  }
}; 
export const getProUserEventDates = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    const events = await Event.find({ proUserId: userObjectId })
      .select('eventTime status')
      .sort('eventTime');

    const eventDates = events.map(event => ({
      date: event.eventTime,
      status: event.status,
      isPast: event.eventTime < now,
      isUpcoming: event.eventTime >= now
    }));

    return res.status(200).json({
      success: true,
      eventDates
    });

  } catch (error) {
    console.error("Error fetching event dates:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get event dates',
      error: error.message 
    });
  }
};