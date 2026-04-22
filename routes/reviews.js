const express = require('express');
const { getReviews, createReview, updateReview, deleteReview, getReview } = require('../controllers/reviews');
const { protect } = require('../middleware/auth');

const router = express.Router();


router.route('/')
    .get(getReviews)
    .post(protect, createReview);

router.route('/:id')
    .get(getReview)
    .put(protect, updateReview)
    .delete(protect, deleteReview);

module.exports = router;