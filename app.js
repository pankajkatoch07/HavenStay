const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("@stz184/connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

//routers
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");

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

const sessionOptions = {
  secret: 'keyboardcat',
  resave: false,
  saveUninitialized: true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 1000 * 60 * 60 * 24 * 3,
    httpOnly : true
  }
}

// root page
app.get("/", (req, res) => {
    res.send("Welcome to the home page");
});

app.use(session(sessionOptions));
app.use(flash());

//passport uses session for authentication
app.use(passport.initialize());
app.use(passport.session());
//It is used to use static authenticate method strategy
passport.use(new LocalStrategy(User.authenticate()));
//static methods all the info relatede to user is stored in a session then it means to serialize 
passport.serializeUser(User.serializeUser());
// when user ends the session then we need to deserialize 
passport.deserializeUser(User.deserializeUser());

//middleware to use for flash
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//listings routes present in routes folder
app.use("/listings" , listings);

//reviews routes in routes folder
app.use("/listings/:id/reviews" , reviews);

//user router
app.use("/" , userRouter);

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

 