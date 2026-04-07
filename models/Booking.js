const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dentist:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dentist',
        required: true
    }, 
    date: {
        type: Date,
        required: [true, 'Please provide a booking date'],
        validate: {
            validator: function(value) {
                // Get start of today in Bangkok (GMT+7) then convert to UTC
                const now = new Date();
                const bangkokNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
                bangkokNow.setUTCHours(0, 0, 0, 0);
                const startOfTodayUTC = new Date(bangkokNow.getTime() - 7 * 60 * 60 * 1000);

                return value >= startOfTodayUTC;
            },
            message: 'Booking date must be today or in the future'
        }

    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

// Convert GMT+7 input to UTC before validation
BookingSchema.pre('validate', function(next) {
    if (this.date) {
        this.date = new Date(this.date.getTime() - (7 * 60 * 60 * 1000));
    }
    next();
});

module.exports = mongoose.model('Booking', BookingSchema);