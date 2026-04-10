const express = require('express');
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

const { 
  getAllAnnouncements, 
  getAnnouncementById, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} = require('../controllers/announcement');

router.route("/")
  .get(getAllAnnouncements)
  .post(protect, authorize("admin"), createAnnouncement)

router.route("/:id")
  .get(getAnnouncementById)
  .put(protect, authorize("admin"), updateAnnouncement)
  .delete(protect, authorize("admin"), deleteAnnouncement)

module.exports = router;