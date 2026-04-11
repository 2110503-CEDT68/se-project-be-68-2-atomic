const Announcement = require('../models/Announcement');


// @desc	Get all announcements
// @route	GET /api/announcements
// @access	Public
exports.getAnnouncements = async (req,res,next) => {
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
	query = Announcement.find(JSON.parse(queryStr)).populate({
        path: 'author',
        select: 'name email'
    });

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
		query = query.sort('-createdAt'); // Define default Sorting
	}

	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const startIndex = (page-1) * limit;
	const endIndex = page * limit;

	try{
		// Pagination (Cont.)
		const total = await Announcement.countDocuments();
		query = query.skip(startIndex).limit(limit); // Set the query to show in specified page range

		// Executing Query
		const announcements = await query;

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
			count: announcements.length,
			pagination,
			data: announcements
		});
	}catch(err){
		console.log(err);
		res.status(500).json({
			success:false,
			message: "Cannot get announcements"
		});
	}
};



// @desc	Get single announcement
// @route	GET /api/announcements/:id
// @access	Public
exports.getAnnouncement = async (req,res,next)=>{

	try{
		const announcement = await Announcement.findById(req.params.id).populate({
            path: 'author',
            select: 'name email'
        });

		if(!announcement){
			return res.status(404).json({
				success:false,
				message:`No announcement with id ${req.params.id}`
			});
		}

		res.status(200).json({
			success:true,
			data: announcement
		});
	}catch(err){
		console.log(err);
		res.status(500).json({
			success:false,
			message:"Cannot get announcement"
		});
	}
};



// @desc	Create a new announcement
// @route	POST /api/announcements
// @access	Private (Admin only)
exports.createAnnouncement = async (req,res,next)=>{

	try{
        req.body.author = req.user.id;
		const announcement = await Announcement.create(req.body);

		res.status(201).json({
			success:true,
			data: announcement
		});
	}catch(err){
		console.log(err);
		res.status(400).json({
			success:false,
			message:"Cannot create announcement"
		});
	}
};



// @desc	Update announcement
// @route	PUT /api/announcements/:id
// @access	Private (Admin only)
exports.updateAnnouncement = async (req,res,next)=>{

	try{
        const updateData = { ...req.body, isEdited: true };
		const announcement = await Announcement.findByIdAndUpdate(
			req.params.id,
			updateData,
			{ new:true, runValidators:true }
		);

		if(!announcement){
			return res.status(404).json({
				success:false,
				message:`No announcement with id ${req.params.id}`
			});
		}

		res.status(200).json({
			success:true,
			data: announcement
		});
	}catch(err){
		console.log(err);
		res.status(400).json({
			success:false,
			message:"Cannot update announcement"
		});
	}
};



// @desc	Delete announcement
// @route	DELETE /api/announcements/:id
// @access	Private (Admin only)
exports.deleteAnnouncement = async (req,res,next)=>{

	try{
		const announcement = await Announcement.findById(req.params.id);

		if(!announcement){
			return res.status(404).json({
				success:false,
				message:`No announcement with id ${req.params.id}`
			});
		}

		await Announcement.deleteOne({_id: req.params.id});

		res.status(200).json({
			success:true,
			data:{}
		});
	}catch(err){
		console.log(err);
		res.status(500).json({
			success:false,
			message:"Cannot delete announcement"
		});
	}
};