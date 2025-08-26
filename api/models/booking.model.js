import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Made optional to support guest bookings
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  appointmentType: {
    type: String,
    required: true,
    enum: [
      'Counseling Session',
      'Medical Consultation',
      'Mental Health Support',
      'Academic Counseling',
      'Career Guidance',
      // Added new types from the updated version
      'Mental Health Counseling',
      'Academic Support'
    ]
  },
  // Support both old and new date/time field names
  date: {
    type: String,
    required: function() {
      return !this.preferredDate; // Required if preferredDate is not provided
    }
  },
  time: {
    type: String,
    required: function() {
      return !this.preferredTime; // Required if preferredTime is not provided
    }
  },
  // New preferred date/time fields
  preferredDate: {
    type: Date,
    required: function() {
      return !this.date; // Required if date is not provided
    }
  },
  preferredTime: {
    type: String,
    required: function() {
      return !this.time; // Required if time is not provided
    }
  },
  additionalNotes: {
    type: String,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: [
      'Pending', 'Confirmed', 'Cancelled', 'Completed', // Original values
      'pending', 'confirmed', 'cancelled', 'completed'  // New values (lowercase)
    ],
    default: 'Pending'
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  // New field from updated version
  confirmedDateTime: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    maxlength: 500, // Added maxlength from new version
    default: ''
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries (keeping original + adding new)
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, date: 1 });
bookingSchema.index({ appointmentType: 1, status: 1 });
// New indexes from updated version
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ email: 1, createdAt: -1 }); // For guest booking lookups

// Virtual for formatted date/time (enhanced to handle both field types)
bookingSchema.virtual('formattedDateTime').get(function() {
  const displayDate = this.preferredDate ? 
    this.preferredDate.toISOString().split('T')[0] : 
    this.date;
  const displayTime = this.preferredTime || this.time;
  return `${displayDate} at ${displayTime}`;
});

// Virtual to get the actual booking date (handles both formats)
bookingSchema.virtual('bookingDate').get(function() {
  if (this.preferredDate) {
    return this.preferredDate;
  }
  return this.date ? new Date(this.date) : null;
});

// Virtual to get the actual booking time
bookingSchema.virtual('bookingTime').get(function() {
  return this.preferredTime || this.time;
});

// Instance method to check if booking can be cancelled (enhanced)
bookingSchema.methods.canBeCancelled = function() {
  const bookingDate = this.bookingDate;
  if (!bookingDate) return false;
  
  const now = new Date();
  const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);
  
  // Can cancel if booking is more than 24 hours away and status allows cancellation
  const cancelableStatuses = ['Pending', 'pending', 'Confirmed', 'confirmed'];
  return hoursUntilBooking > 24 && cancelableStatuses.includes(this.status);
};

// Instance method to check if user owns this booking (for guest bookings)
bookingSchema.methods.belongsToUser = function(userId, email) {
  if (userId && this.userId) {
    return this.userId.toString() === userId.toString();
  }
  // For guest bookings, match by email
  if (email && this.email) {
    return this.email.toLowerCase() === email.toLowerCase();
  }
  return false;
};

// Static method to get upcoming bookings (enhanced)
bookingSchema.statics.getUpcomingBookings = function(userId, email = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const query = {
    $or: [
      { date: { $gte: today.toISOString().split('T')[0] } },
      { preferredDate: { $gte: today } }
    ],
    status: { $in: ['Pending', 'pending', 'Confirmed', 'confirmed'] }
  };
  
  // Add user filter
  if (userId) {
    query.userId = userId;
  } else if (email) {
    query.email = email.toLowerCase();
  }
  
  return this.find(query).sort({ 
    preferredDate: 1, 
    date: 1, 
    preferredTime: 1, 
    time: 1 
  });
};

// Static method to get bookings by date range (enhanced)
bookingSchema.statics.getBookingsByDateRange = function(startDate, endDate, status = null) {
  const query = {
    $or: [
      { 
        date: { 
          $gte: startDate.toISOString().split('T')[0], 
          $lte: endDate.toISOString().split('T')[0] 
        } 
      },
      { 
        preferredDate: { 
          $gte: startDate, 
          $lte: endDate 
        } 
      }
    ]
  };
  
  if (status) {
    // Handle both uppercase and lowercase status values
    query.status = Array.isArray(status) ? status : [status, status.toLowerCase()];
  }
  
  return this.find(query)
    .populate('userId', 'username email')
    .populate('confirmedBy', 'username email')
    .sort({ preferredDate: 1, date: 1, preferredTime: 1, time: 1 });
};

// Static method to find bookings by email (for guest bookings)
bookingSchema.statics.getBookingsByEmail = function(email) {
  return this.find({ 
    email: email.toLowerCase(),
    userId: { $exists: false } // Only guest bookings
  }).sort({ createdAt: -1 });
};

// Static method to check slot availability
bookingSchema.statics.isSlotAvailable = function(date, time, excludeId = null) {
  const query = {
    $or: [
      { date: date, time: time },
      { preferredDate: new Date(date), preferredTime: time }
    ],
    status: { $in: ['Pending', 'pending', 'Confirmed', 'confirmed'] }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.findOne(query).then(booking => !booking);
};

// Pre-save middleware to validate date is not in the past (enhanced)
bookingSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('date') || this.isModified('preferredDate')) {
    const bookingDate = this.bookingDate;
    
    if (bookingDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        const error = new Error('Cannot book appointments for past dates');
        error.status = 400;
        return next(error);
      }
    }
  }
  
  // Ensure data consistency - if preferredDate/Time provided, use those
  if (this.preferredDate && this.preferredTime) {
    this.date = this.preferredDate.toISOString().split('T')[0];
    this.time = this.preferredTime;
  } else if (this.date && this.time && !this.preferredDate) {
    this.preferredDate = new Date(this.date);
    this.preferredTime = this.time;
  }
  
  next();
});

// Pre-save middleware to normalize status values
bookingSchema.pre('save', function(next) {
  // Normalize status to handle both uppercase and lowercase
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed', 
    'cancelled': 'Cancelled',
    'completed': 'Completed'
  };
  
  if (statusMap[this.status]) {
    this.status = statusMap[this.status];
  }
  
  next();
});

// Post-save middleware to log booking creation (enhanced)
bookingSchema.post('save', function(doc, next) {
  if (this.isNew) {
    const userInfo = doc.userId ? `user ${doc.userId}` : `guest ${doc.email}`;
    console.log(`New booking created: ${doc._id} for ${userInfo} on ${doc.formattedDateTime}`);
  }
  next();
});

// Method to convert to API response format
bookingSchema.methods.toAPIResponse = function() {
  const obj = this.toObject();
  
  // Ensure consistent field names for API
  obj.date = obj.preferredDate ? obj.preferredDate.toISOString().split('T')[0] : obj.date;
  obj.time = obj.preferredTime || obj.time;
  
  // Add computed fields
  obj.formattedDateTime = this.formattedDateTime;
  obj.canBeCancelled = this.canBeCancelled();
  
  return obj;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;