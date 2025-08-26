// api/controllers/booking.controller.js
import Booking from '../models/booking.model.js';
import { errorHandler } from '../utils/error.js';

// Create a new booking
export const createBooking = async (req, res, next) => {
  try {
    const { fullName, email, appointmentType, date, time, preferredDate, preferredTime, additionalNotes } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !appointmentType) {
      return next(errorHandler(400, 'Full name, email, and appointment type are required'));
    }

    // Validate date/time fields
    if (!date && !preferredDate) {
      return next(errorHandler(400, 'Date is required'));
    }
    
    if (!time && !preferredTime) {
      return next(errorHandler(400, 'Time is required'));
    }

    // Check slot availability
    const bookingDate = preferredDate || date;
    const bookingTime = preferredTime || time;
    
    const isAvailable = await Booking.isSlotAvailable(bookingDate, bookingTime);
    if (!isAvailable) {
      return next(errorHandler(400, 'This time slot is already booked'));
    }

    const newBooking = new Booking({
      userId: req.user?.id || undefined, // Support guest bookings
      fullName,
      email,
      appointmentType,
      date,
      time,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTime,
      additionalNotes: additionalNotes || '',
      status: 'Pending'
    });

    const savedBooking = await newBooking.save();
    
    // Populate user details for response if userId exists
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('userId', 'username email')
      .populate('confirmedBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking.toAPIResponse()
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    next(error);
  }
};

// Get current user's bookings - Updated to handle different query parameters
export const getMyBookings = async (req, res, next) => {
  try {
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const email = req.user.email;

    // Build query for user's bookings (both authenticated and guest bookings with same email)
    let query = {
      $or: [
        { userId: userId },
        { email: email.toLowerCase(), userId: { $exists: false } }
      ]
    };

    // Add search functionality
    if (search) {
      query.$and = [
        query,
        {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { appointmentType: { $regex: search, $options: 'i' } },
            { additionalNotes: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      query.status = { $in: [status, status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()] };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate('userId', 'username email')
      .populate('confirmedBy', 'username email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(query);

    // Calculate user-specific statistics
    const userQuery = {
      $or: [
        { userId: userId },
        { email: email.toLowerCase(), userId: { $exists: false } }
      ]
    };

    const stats = await Promise.all([
      Booking.countDocuments(userQuery),
      Booking.countDocuments({ ...userQuery, status: { $in: ['Pending', 'pending'] } }),
      Booking.countDocuments({ ...userQuery, status: { $in: ['Confirmed', 'confirmed'] } }),
      Booking.countDocuments({ ...userQuery, status: { $in: ['Completed', 'completed'] } }),
      Booking.countDocuments({ ...userQuery, status: { $in: ['Cancelled', 'cancelled'] } })
    ]);

    const formattedBookings = bookings.map(booking => booking.toAPIResponse());

    res.status(200).json({
      success: true,
      bookings: formattedBookings,
      count: bookings.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBookings,
        pages: Math.ceil(totalBookings / parseInt(limit))
      },
      statistics: {
        total: stats[0],
        pending: stats[1],
        confirmed: stats[2],
        completed: stats[3],
        cancelled: stats[4]
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    next(error);
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async (req, res, next) => {
  try {
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { appointmentType: { $regex: search, $options: 'i' } },
        { additionalNotes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status && status !== 'all') {
      // Handle both uppercase and lowercase status values
      query.status = { $in: [status, status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()] };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate('userId', 'username email')
      .populate('confirmedBy', 'username email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(query);

    // Calculate booking statistics
    const stats = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['Pending', 'pending'] } }),
      Booking.countDocuments({ status: { $in: ['Confirmed', 'confirmed'] } }),
      Booking.countDocuments({ status: { $in: ['Completed', 'completed'] } }),
      Booking.countDocuments({ status: { $in: ['Cancelled', 'cancelled'] } })
    ]);

    const formattedBookings = bookings.map(booking => booking.toAPIResponse());

    res.status(200).json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBookings,
        pages: Math.ceil(totalBookings / parseInt(limit))
      },
      statistics: {
        total: stats[0],
        pending: stats[1],
        confirmed: stats[2],
        completed: stats[3],
        cancelled: stats[4]
      }
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    next(error);
  }
};

// Update booking status (Admin only)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, confirmedDateTime } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return next(errorHandler(400, 'Invalid status value'));
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return next(errorHandler(404, 'Booking not found'));
    }

    // Update booking fields
    booking.status = status;
    
    if (adminNotes !== undefined) {
      booking.adminNotes = adminNotes;
    }

    // Handle confirmation
    if (status === 'Confirmed' || status === 'confirmed') {
      booking.confirmedBy = req.user.id;
      booking.confirmedAt = new Date();
      
      if (confirmedDateTime) {
        booking.confirmedDateTime = new Date(confirmedDateTime);
      }
    }

    // Handle cancellation
    if (status === 'Cancelled' || status === 'cancelled') {
      if (req.body.cancellationReason) {
        booking.cancellationReason = req.body.cancellationReason;
      }
    }

    await booking.save();

    // Populate for response
    const updatedBooking = await Booking.findById(id)
      .populate('userId', 'username email')
      .populate('confirmedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking: updatedBooking.toAPIResponse()
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    next(error);
  }
};

// Cancel booking (User or Admin)
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return next(errorHandler(404, 'Booking not found'));
    }

    // Check if user owns the booking or is admin
    if (!req.user.isAdmin && !booking.belongsToUser(req.user.id, req.user.email)) {
      return next(errorHandler(403, 'Access denied'));
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return next(errorHandler(400, 'Booking cannot be cancelled at this time'));
    }

    // Update booking status
    booking.status = 'Cancelled';
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    await booking.save();

    // Populate for response
    const updatedBooking = await Booking.findById(id)
      .populate('userId', 'username email')
      .populate('confirmedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking.toAPIResponse()
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    next(error);
  }
};

// Get user's booking by ID (User can only access their own bookings)
export const getUserBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const email = req.user.email;

    const booking = await Booking.findOne({
      _id: id,
      $or: [
        { userId: userId },
        { email: email.toLowerCase(), userId: { $exists: false } }
      ]
    })
    .populate('userId', 'username email')
    .populate('confirmedBy', 'username email');

    if (!booking) {
      return next(errorHandler(404, 'Booking not found or access denied'));
    }

    res.status(200).json({
      success: true,
      booking: booking.toAPIResponse()
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    next(error);
  }
};

// Update user's own booking (Limited to certain fields)
export const updateUserBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const email = req.user.email;
    const { fullName, additionalNotes, cancellationReason } = req.body;

    // Find booking that belongs to user
    const booking = await Booking.findOne({
      _id: id,
      $or: [
        { userId: userId },
        { email: email.toLowerCase(), userId: { $exists: false } }
      ]
    });

    if (!booking) {
      return next(errorHandler(404, 'Booking not found or access denied'));
    }

    // Users can only update certain fields and only if booking is pending
    if (booking.status !== 'Pending' && booking.status !== 'pending') {
      return next(errorHandler(400, 'Only pending bookings can be updated'));
    }

    // Update allowed fields
    if (fullName) booking.fullName = fullName;
    if (additionalNotes !== undefined) booking.additionalNotes = additionalNotes;
    if (cancellationReason) booking.cancellationReason = cancellationReason;

    await booking.save();

    // Populate for response
    const updatedBooking = await Booking.findById(id)
      .populate('userId', 'username email')
      .populate('confirmedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking.toAPIResponse()
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    next(error);
  }
};
