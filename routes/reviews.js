const express = require('express');
const { getReviews, createReview, updateReview, deleteReview, getReview } = require('../controllers/reviews');

const router = express.Router();

router.route('/')
    .get(getReviews)
    .post(createReview);

router.route('/:id')
    .get(getReview)
    .put(updateReview)
    .delete(deleteReview);

module.exports = router;