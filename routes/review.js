const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {  reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn , isReviewAuthor} = require("../middleware.js");

// controller for review 
const reviewController = require("../controllers/review.js");

//Review Route Post Route
router.post("/" ,isLoggedIn,validateReview, wrapAsync(reviewController.review));

// Delete Route 
router.delete("/:reviewId", isLoggedIn, isReviewAuthor , wrapAsync (reviewController.deleteReview));

module.exports = router;
