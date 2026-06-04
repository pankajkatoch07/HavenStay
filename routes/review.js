const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {  reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

//function to create validation for reviews
const validateReview = (req, res, next) => {
    if (!req.body || !req.body.review) {
        throw new ExpressError(400, "Review data is required.");
    }
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.message);
    }
    next();
}

//Review Route Post Route
router.post("/" ,validateReview, wrapAsync( async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found.");
    }
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

// Delete Route 
router.delete("/:reviewId" , wrapAsync (async (req,res)=> {
    let {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

module.exports = router;
