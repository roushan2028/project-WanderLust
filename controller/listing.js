const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    if(!allListings){
        req.flash("error","Listing you want to find does not exist");
        res.redirect("/listings");
    }
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req,res)=>{
    console.log(req.user);
    res.render("listings/new.ejs");
}

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    let list = await Listing.findById(id);
    if(!list){
        req.flash("error","Listing you find does not exist");
        res.redirect("/listings");
    }
    let originalLink = list.image.url;
    originalLink = originalLink.replace("/upload","/upload/h_300/w_250/e_blur");
    res.render("listings/edit.ejs",{list,originalLink});
}

module.exports.editListing = async(req,res)=>{
    // if(!req.body.listing){
    //     next(new ExpressError(404,"Send valid data for listing"));
    //     // in this case if any feild is filled with listing it will not show error so, for
    //     // respective data of listing we should assign error based on different data value of listings
    // }
    // let result = listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error){
    //     throw new ExpressError(404,result.error);
    // }
    // the respect error is detected through joi and throw that error..
    let listing = req.body.listing;
    if(!listing){
        req.flash("error","Listing you find does not exist");
        res.redirect("/listings");
    }
    listing.owner = req.user._id;
    let {id} =req.params;
    if(req.file){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image = {url,filename};
    }
    await Listing.findByIdAndUpdate(id,listing);
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`)

}

module.exports.deleteListing = async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted");
    res.redirect('/listings');
}

module.exports.renderPriceFilter = async (req,res)=>{
    let {pr} = req.params;
    const maxPrice = Number(pr);
    if (Number.isNaN(maxPrice)) {
        throw new ExpressError(400, "Invalid price filter");
    }
    const list = await Listing.find({ price: { $lte: maxPrice } });
    res.render("listings/index.ejs", { allListings: list });
}

module.exports.createNewListing = async (req,res,next)=>{
    // let {title,description,image,price,location,country} = req.body;
    // let listing = req.body.listing;
    // if(!req.body.listing){
    //     next(new ExpressError(404,"Send valid data for listing"));
    // }
    let response =await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit:1
        })
        .send();
    let url=req.file.path;
    let filename=req.file.filename;
    let newlist = new Listing(req.body.listing);
    console.log(newlist);
    newlist.geometry = response.body.features[0].geometry;
    newlist.owner = req.user._id;
    newlist.image = {url,filename};
    let sL = await newlist.save();
    console.log(sL);
    req.flash("success","New Listing created!");
    res.redirect("/listings");
};

module.exports.renderAlisting = async (req, res) => {
    const { id } = req.params;
    const list1 = await Listing.findById(id).populate({path : "reviews",populate:{path:"author"}}).populate("owner");
    if(!list1){
        throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/show", { list1 });
};

module.exports.searchListings = async (req,res)=>{
    let {query} =req.params;
    let list = await Listing.find({title: { $regex: query, $options: 'i'}});
    if(!list){
        rea.flash("error","Listing you want to find does not exist");
        res.redirect("/listings");
    }
    res.render("listings/index.ejs",{allListings:list});
    res.redirect("/listings");
}