const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'author',
        required: true
    },
    name:{
        type: String,
        required: [true, 'Please add a title'],
        unique: true,
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    description:{
        type: String,
        required: [true, 'Please add a description'],
        trim: true,
        maxlength: [5000, 'Description can not be more than 5000 characters']
    },
    logoURL: {
        type: String,
        required: true,
        trim: true
    },
    bannerURL: {
        type: String,
        required: true,
        trim: true
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);