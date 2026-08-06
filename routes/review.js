const express = require('express');
const router = express.Router({ mergeParams: true });

const Review = require('../models/review.js');
const Listing = require('../models/listing'); // Make sure paths are correct!
const wrapAsync = require("../utils/asyncWrap.js");
const ExpressError = require('../utils/ExpressError.js');
const {reviewSchema} = require("../schema.js");
const {isLogIn, isROwner} = require("../middlewares.js");

const reviewController = require("../controller/review.js");

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);

    if(error) {
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

router.post("", isLogIn, validateReview, wrapAsync(reviewController.postReview));

// delete review route

// we use $pull request to delete id of review which we want to delete from reviews array in listing

router.delete("/:reviewid", isLogIn,isROwner, wrapAsync(reviewController.destroyReview));

module.exports = router;