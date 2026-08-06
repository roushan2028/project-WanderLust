const Listing = require('./models/listing');
const Review = require('./models/review');

module.exports.isLogIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You should login First");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req,res,next)=>{
    let {id} =req.params;
    let listings =await Listing.findById(id);
    if(!listings.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You dont't have permission to edit/delete");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isROwner = async(req,res,next)=>{
    let {id,reviewid} =req.params;
    let rev = await Review.findById(reviewid);
    if(!rev.author.equals(res.locals.currUser._id)){
        req.flash("error","you are not allowed to delete");
        return res.redirect(`/listings/${id}`);
    }
    next();
}