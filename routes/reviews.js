const express = require('express');
const { getReviews, createReview, updateReview, deleteReview, getReview } = require('../controllers/reviews');
const { protect } = require('../middleware/auth');

const router = express.Router();


router.route('/')
    .get(getReviews)

// Create Review Route (Nested)
// @route POST /api/dentists/:dentistId/reviews
router.route('/')
    .post(protect, createReview);

router.route('/:id')
    .get(getReview)
    .put(protect, updateReview)
    .delete(protect, deleteReview);

module.exports = router;