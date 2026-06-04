const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");


// function to use joi for validation error
const validateListing = (req, res, next) => {
    if (!req.body || !req.body.listing) {
        throw new ExpressError(400, "Listing data is required.");
    }
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.message);
    }
    next();
}

//INDEX ROUTE
router.get("/", wrapAsync(async (req, res, next) => {
    const alllistings = await Listing.find();
    res.render("listings/index.ejs", { alllistings })
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//SHOW ROUTE
router.get("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/",validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",validateListing, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//delete Route
router.delete("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let deletedLisitng = await Listing.findByIdAndDelete(id);
    console.log(deletedLisitng);
    res.redirect("/listings");
}));

module.exports = router;