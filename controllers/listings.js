const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");
const { CATEGORY_OPTIONS, normalizeCategory, getCategoryLabel } = require("../utils/categories");

const getCloudinaryPreviewUrl = (listing) => {
    if (!listing?.image?.filename) return listing?.image?.url;

    return cloudinary.url(listing.image.filename, {
        secure: true,
        transformation: [{ width: 250, height: 300, crop: "fill" }],
    });
};

// index route
module.exports.index = async (req ,res) => {
    const selectedCategory = req.query.category ? normalizeCategory(req.query.category) : "trending";
    const filter = { category: selectedCategory };
    const alllistings = await Listing.find(filter);
    res.render("listings/index.ejs", { alllistings, categories: CATEGORY_OPTIONS, selectedCategory, getCategoryLabel })
}

//New Route
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

// Show Route
module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews" , populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error" , "Listing does not exist");
        return res.redirect("/listings")
    }
    res.render("listings/show.ejs", { listing });
}

//Create Route
module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.category = normalizeCategory(req.body.listing.category);
    newListing.image = {url , filename};
    await newListing.save();
    req.flash("success" , "New Listing Created!");
    res.redirect("/listings");
}

//Edit route
module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing does not exist");
        return res.redirect("/listings")
    }

    const previewImageUrl = getCloudinaryPreviewUrl(listing);
    res.render("listings/edit.ejs", { listing, previewImageUrl });
}

// Update Route
module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    const listingData = {
        ...req.body.listing,
        category: normalizeCategory(req.body.listing.category)
    };
    let listing = await Listing.findByIdAndUpdate(id, listingData);
    if(req.file) {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = {url , filename };
    await listing.save();   
    }
    
    req.flash("success" , "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

// Delete Route
module.exports.deleteListing = async (req, res, next) => {
    let { id } = req.params;
    let deletedLisitng = await Listing.findByIdAndDelete(id);
    console.log(deletedLisitng);
    req.flash("success" , "Listing Deleted!");
    res.redirect("/listings");
}