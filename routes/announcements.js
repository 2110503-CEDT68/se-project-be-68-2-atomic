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

// POST create announcement (admin only)
router.route('/')
  .post(protect, authorize('admin'), createAnnouncement);

// GET single announcement by id
// PUT update announcement by id (admin only)
// DELETE remove announment
router.route('/:id')
  .get(getAnnouncement)
  .put(protect, authorize('admin'), updateAnnouncement)
  .delete(protect,authorize('admin'),deleteAnnouncement)