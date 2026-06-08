const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

//listings routes present in routes folder
app.use("/listings" , listings);

//reviews routes in routes folder
app.use("/listings/:id/reviews" , reviews);


//error handler middlewares
app.all("*any", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something is wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});

//listening to all the requests
app.listen(8080, () => {
    console.log("Listening to Port 8080");
});

 