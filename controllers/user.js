const User = require("../models/user");

//render signup form
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
}

//User Signup
module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        //method to automatcially login
        req.login(registeredUser, (err, next) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to HavenStay!");
            res.redirect("/listings");
        });
    }
    catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

//User Login Form
module.exports.loginForm = (req, res) => {
    if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo;
    }
    res.locals.returnTo = req.session.returnTo;
    res.render("users/login.ejs");
}

//User Login
module.exports.login = (req, res) => {
        req.flash("success", "Welcome back!");
        const redirectUrl = req.body.returnTo || req.session.returnTo || "/listings";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
}

// user logout
module.exports.logout = (req, res, err) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    })
}