const express = require("express");
const app= express();
const path= require("path");
const methodOverride= require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Task = require("./models/tasks.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn} = require("./middleware.js");

const dbUrl = "mongodb://127.0.0.1:27017/TaskNest";
main()
.then((res) => {
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());


const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge:  7*24*60*60*1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});



//Home Route

app.get("/tasks", wrapAsync( async (req, res) => {
    const tasks = await Task.find({});
    res.render("./tasks/index.ejs", {tasks} );
}));


//Create New Task Route 

app.post("/tasks", isLoggedIn, wrapAsync(async (req, res) => {
    if(!req.body.task){
        throw new ExpressError(400, "Send Valid Data");
    }
    
     const newTask = new Task(req.body.task);
     newTask.author = req.user._id;
    await newTask.save();
    req.flash("success", "new task added");
    res.redirect("/tasks");
}));

//Delete Route

app.delete("/tasks/:id",isLoggedIn,  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedTask = await Task.findByIdAndDelete(id);
    console.log(deletedTask);
    req.flash("success", "task deleted");
    res.redirect("/tasks");
}));

//User Route

app.get("/signup", wrapAsync(async (req, res) => {
    res.render("./users/signup.ejs");
}));

app.post("/signup", wrapAsync( async(req, res) => {
    try{
        let {username, email, password} = req.body;
    const newUser = new User({email, username});
   const registerUser = await User.register(newUser, password);
   console.log(registerUser);
   req.login(registerUser, (err) => {
    if(err){
        return next(err);
    }
    req.flash("success", "you are now signed up");
   res.redirect("/tasks");
   });
   
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
}));

app.get("/login", wrapAsync( async(req, res) => {
    res.render("./users/login.ejs");
}));

app.post("/login",passport.authenticate("local",{ failureRedirect: "/login", failureFlash: true}), wrapAsync(async(req, res) => {
    req.flash("success", "Welcome back to TaskNest");
    res.redirect("/tasks");
}));

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "you are logged out");
        res.redirect("/tasks");
    });
});

app.all("*", (req, res, next)=> {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let {statusCode, message} = err;
    res.status(statusCode).render("error.ejs", {message});
    //res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080.");
});
