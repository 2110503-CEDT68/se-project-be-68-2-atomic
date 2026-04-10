const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "กรุณาระบุหัวข้อประกาศ"],
      trim: true,
      maxlength: [150, "หัวข้อประกาศยาวเกินไป"]
    },
    picture: {
      type: String,
      default: null
    },
    content: {
      type: String,
      required: [true, "กรุณาระบุเนื้อหาประกาศ"]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "กรุณาระบุผู้สร้างประกาศ"]
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);