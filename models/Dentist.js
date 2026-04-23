const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    yearsOfExperience: {
        type: Number,
        required: [true,'Please provide years of experience'],
        min: [0, 'Years of experience cannot be negative']
    },
    areaOfExpertise: {
        type: String,
        required: [true, 'Please provide area of expertise'],
        trim: true,
        maxlength: [100,'Area of expertise cannot be more than 100 characters']
    },
    imageURL: {
        type: String,
        required: true,
        trim: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    averageRating: {
        type: Number,
        default: 0
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}); 

// Reverse Populate with Virtuals
DentistSchema.virtual('bookings',{
    ref: 'Booking',
    localField: '_id',
    foreignField: 'dentist',
    justOne: false
});

module.exports = mongoose.model('Dentist', DentistSchema);