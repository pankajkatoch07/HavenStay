const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAync.js");
const ExpressError = require("./utils/ExpressError.js");;

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/HavenStay');
}

main().then(() => { console.log("Connected to Database") }).catch(err => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); //parses req.params
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//INDEX ROUTE
app.get("/listings", async (req, res) => {
    const alllistings = await Listing.find();
    res.render("listings/index.ejs", { alllistings })
});

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//SHOW ROUTE
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

//Create Route
app.post("/listings", wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

//delete Route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedLisitng = await Listing.findByIdAndDelete(id);
    console.log(deletedLisitng);
    res.redirect("/listings");
});

app.get("/", (req, res) => {
    res.send("Welcome to the home page");
});

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
    next(new ExpressError(404,"Page not Found!"));
});

app.use((err, req, res, next) => {
    let { status = 500, message = "Error" } = err;
    res.status(status).send(message);
})

app.listen(8080, () => {
    console.log("Listening to Port 8080");
});

