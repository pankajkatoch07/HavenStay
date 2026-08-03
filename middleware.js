const Listing = require("./models/listing");
const Review = require("./models/review.js");
const { listingSchema , reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

const normalizeListingBody = (req) => {
    if (!req.body || typeof req.body !== "object") return null;

    if (req.body.listing && typeof req.body.listing === "object") {
        return req.body.listing;
    }

    const listingData = {};
    for (const [key, value] of Object.entries(req.body)) {
        if (typeof key !== "string" || !key.startsWith("listing[")) continue;

        const normalizedKey = key.replace(/^listing\[/, "").replace(/\]$/, "");
        const parts = normalizedKey.split("][");
        let current = listingData;

        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                current[part] = value;
            } else {
                if (!current[part] || typeof current[part] !== "object") {
                    current[part] = {};
                }
                current = current[part];
            }
        });
    }

    if (Object.keys(listingData).length) {
        req.body.listing = listingData;
        return listingData;
    }

    return null;
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in to do that.");
        return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error" , "You don't have permission to edit");
        return res.redirect(`/listings/${id}`)
    }

    next();
}

// middleware to use joi for validation error
module.exports.validateListing = (req, res, next) => {
    const listingData = normalizeListingBody(req);
    if (!listingData) {
        throw new ExpressError(400, "Listing data is required.");
    }

    let { error } = listingSchema.validate({ listing: listingData });
    if (error) {
        throw new ExpressError(400, error.message);
    }
    next();
}

//function to create validation for reviews
module.exports.validateReview = (req, res, next) => {
    if (!req.body || !req.body.review) {
        throw new ExpressError(400, "Review data is required.");
    }
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.message);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id , reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error" , "You don't have permission to delete this review");
        return res.redirect(`/listings/${id}`)
    }

    next();
}
