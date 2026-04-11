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
router.route('/:id')
  .get(getAnnouncement)
  .put(protect, authorize('admin'), updateAnnouncement);