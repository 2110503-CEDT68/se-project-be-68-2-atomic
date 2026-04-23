const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
    rating:{
        type: Number,
        required: [true, 'Please add a rating'],
        min: [1, 'Rating must be between 1 and 5'],
        max: [5, 'Rating must be between 1 and 5']
    },
    title:{
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    comment:{
        type: String,
        required: [true, 'Please add a comment'],
        trim: true,
        maxlength: [500, 'Comment can not be more than 500 characters']
    },
    isEdited:{
        type: Boolean,
        default: false
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    deletedAt:{
        type: Date
    },
    createdAt:{
        type: Date,
        default: Date.now
    }

});

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(dentistId) {
    const obj = await this.aggregate([
        {
            $match: { dentist: dentistId, isDeleted: false }
        },
        {
            $group: {
                _id: '$dentist',
                averageRating: { $avg: '$rating' },
            }
        }
    ]);

    try {
        if (obj[0]) {
            await mongoose.model('Dentist').findByIdAndUpdate(dentistId, {
                averageRating: Math.round(obj[0].averageRating * 10) / 10
            });
        } else {
            await mongoose.model('Dentist').findByIdAndUpdate(dentistId, {
                averageRating: 0
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.dentist);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.dentist);
});

// Hide sensitive fields
ReviewSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.isDeleted;
    delete obj.deletedAt;
    return obj;
};

module.exports = mongoose.model('Review', ReviewSchema);