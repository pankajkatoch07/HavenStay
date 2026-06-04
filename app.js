const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/HavenStay');
}

main().then(() => { console.log("Connected to Database") }).catch(err => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json()); //parses data from like postman or hopscotch
app.use(express.urlencoded({ extended: true })); //parses req.params
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// root page
app.get("/", (req, res) => {
    res.send("Welcome to the home page");
});

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

//INDEX ROUTE
app.get("/listings", wrapAsync(async (req, res, next) => {
    const alllistings = await Listing.find();
    res.render("listings/index.ejs", { alllistings })
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//SHOW ROUTE
app.get("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings",validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id",validateListing, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//delete Route
app.delete("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let deletedLisitng = await Listing.findByIdAndDelete(id);
    console.log(deletedLisitng);
    res.redirect("/listings");
}));

//Review Route Post Route
app.post("/listings/:id/reviews" ,validateReview, wrapAsync( async (req,res) => {
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

// app.get("/testlisting",async (req,res)=>{
//     let sampleListing = new Listing ({
//         title : "My new villa",
//         description: "by the beach",
//         price: 12000,
//         location: "California",
//         country: "Usa"
//     });
//     await sampleListing.save().catch(err => console.log(err));
//     console.log("sample was saved");
//     res.send("Successful Testing");
// });

app.all("*any", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something is wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
})

app.listen(8080, () => {
    console.log("Listening to Port 8080");
});

