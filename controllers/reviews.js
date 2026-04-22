const Dentist = require('../models/Dentist')
const Review = require('../models/Review')

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    let query;
    
    // Copy req.body (Change to Array; 1 index = 1 query)
    const reqQuery = {...req.query};

    // Fields to exclude (We will focus on select & sort specifically in the next part)
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over remove fields and delete them from reqQuery (remove whatever that matches in removeFields)
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    // Create Query String
    let queryStr = JSON.stringify(reqQuery);

    // Create Operator ($gt, $gte, etc.)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding Resource
    query = Review.find(JSON.parse(queryStr)).populate({path: 'dentist', select: 'name'}).populate({path: 'user', select: 'name'}); // Unxecute Yet

    // Select Fields
    if(req.query.select){ // If query includes select
        const fields = req.query.select.split(',').join(' '); // Replace , to space because we use , to split fields in path but we use space to split fields when connect to the database
        query = query.select(fields); // Update Querty to be Executed
    }

    // Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt'); // Sort by Latest
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page-1) * limit;
    const endIndex = page * limit;

    try{
        // Pagination (Cont.)
        const total = await Review.countDocuments();
        query = query.skip(startIndex).limit(limit); // Set the query to show in specified page range

        // Executing Query
        const reviews = await query;

        // Pagination Result
        const pagination = {};

        if(endIndex < total){
            pagination.next = {page: page+1, limit};
        }

        if(startIndex > 0){
            pagination.prev = {page: page-1, limit};
        }

        res.status(200).json({
            success:true,
            count: reviews.length,
            pagination,
            data: reviews
        });
    }catch(err){
        console.log(err.stack);
        res.status(500).json({
            success:false,
            message: "Cannot get reviews"
        });
    }
}

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
    try{
        const review = await Review.findById(req.params.id).populate('dentist').populate('user');

        if(!review){
            return res.status(404).json({
                success:false,
                message:`No review with id ${req.params.id}`
            });
        }

        res.status(200).json({
            success:true,
            data: review
        });
    }catch(err){
        console.log(err.stack);
        res.status(500).json({
            success:false,
            message: "Cannot get review"
        });
    }
}

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (User)
exports.createReview = async (req, res, next) => {
    try{
        // Add user from the request (Protect this route)
        req.body.user = req.user.id;

        const review = await Review.create(req.body);

        res.status(201).json({
            success:true,
            data: review
        });
    }catch(err){
        console.log(err.stack);
        res.status(400).json({
            success:false,
            message: "Cannot create review"
        });
    }
}
