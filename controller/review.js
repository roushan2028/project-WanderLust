const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.postReview = async (req, res) => {
    let {id} =req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    console.log(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyReview = async (req, res, next) => {
    let {id,reviewid} =req.params;
    // let rev = await Review.findById(reviewid);
    // if(!rev.author.equals(res.locals.currUser._id)){
    //     req.flash("error","you are not allowed to delete");
    //     return res.redirect(`/listings/${id}`);
    // }
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash("success","Review deleted");
    res.redirect(`/listings/${id}`);

};