const express = require('express');
const {
	getAnnouncements,
	getAnnouncement,
	createAnnouncement,
	updateAnnouncement,
	deleteAnnouncement
} = require('../controllers/announcements');

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

// GET all announcements
// POST create announcement (admin only)
// GET  Get all announcement ()
router.route('/')
  .get(getAnnouncements)
  .post(protect, authorize('admin'), createAnnouncement);

// GET single announcement by id
// PUT update announcement by id (admin only)
// DELETE remove announment
router.route('/:id')
  .get(getAnnouncement)
  .put(protect, authorize('admin'), updateAnnouncement)
  .delete(protect,authorize('admin'),deleteAnnouncement)

module.exports = router;