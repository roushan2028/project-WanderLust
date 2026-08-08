const express = require('express');

const router = express.Router({mergeParams : true});

const Listing = require('../models/listing'); // Make sure paths are correct!
const wrapAsync = require("../utils/asyncWrap.js");
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema} = require("../schema.js");
const Review = require('../models/review.js');
const {isLogIn,isOwner} =require("../middlewares.js");

const listingController = require("../controller/listing.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage});


const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);

    if(error) {
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLogIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createNewListing));

// New Route
router.get("/new",isLogIn,listingController.renderNewForm); 

router.route("/:id")
    .get(wrapAsync(listingController.renderAlisting))
    .put(isLogIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.editListing))
    .delete(isLogIn,isOwner,wrapAsync(listingController.deleteListing));

router.get("/:id/edit",isLogIn,isOwner,wrapAsync(listingController.renderEditForm));

router.get("/price/:pr",wrapAsync(listingController.renderPriceFilter));

router.get("/search/:query",wrapAsync(listingController.searchListings));

module.exports = router;