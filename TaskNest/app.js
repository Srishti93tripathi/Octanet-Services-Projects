const express = require("express");
const app= express();
const path= require("path");
const methodOverride= require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Task = require("./models/tasks.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

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


//Home Route

app.get("/tasks", wrapAsync( async (req, res) => {
    const tasks = await Task.find({});
    res.render("./tasks/index.ejs", {tasks} );
}));


//Create New Task Route 

app.post("/tasks",wrapAsync(async (req, res) => {
    if(!req.body.task){
        throw new ExpressError(400, "Send Valid Data");
    }
     const newTask = new Task(req.body.task);
    await newTask.save();
    res.redirect("/tasks");
}));

//Delete Route

app.delete("/tasks/:id",  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedTask = await Task.findByIdAndDelete(id);
    console.log(deletedTask);
    res.redirect("/tasks");
}));

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
