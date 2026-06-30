const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require('./models/listing.js');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");




const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// connect to MongoDB
main()
    .then(() => {
        console.log("connected to DB");
    })
async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs"); // tells express to use ejs templating
app.set("views", path.join(__dirname, "views")); // tells express where the views/templates folder is
app.use(express.urlencoded({ extended: true })); // lets express read form data (req.body) from POST requests
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// root route - just a test route
app.get("/", (req, res) => {
    res.send("hi i am root");
})

// index route - shows all listings
app.get("/listings", async(req, res) => {
    const allListings = await Listing.find({}); // fetch every listing from DB
    res.render("listings/index.ejs", { allListings }); // send them to the index page
});

// new route - shows the form to create a new listing
// must come BEFORE "/listings/:id" or express will think "new" is an :id
app.get("/listings/new", async(req, res) => {
    res.render("listings/new.ejs");
})

// show route - shows details of ONE specific listing by its id
app.get("/listings/:id", async(req, res) => {
    let { id } = req.params; // pulls the id value out of the url
    const listing = await Listing.findById(id); // find that one listing in DB
    res.render("listings/show.ejs", { listing });
})

// create route - receives form data and saves a new listing to DB
app.post("/listings", wrapAsync(async(req, res, next) => {
        if (!req.body.listing) {
            throw new ExpressError(400, "send valid data for listing");
        }
        const newListing = new Listing(req.body.listing); // build a new listing using submitted form data
        await newListing.save(); // save it to MongoDB
        res.redirect("/listings"); // go back to the index page to see it


    }))
    //edit route 
app.get("/listings/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//update
app.put("/listings/:id", wrapAsync(async(req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "send valid data for listing");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing });
    res.redirect("/listings");
}));
//de;ete
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));
app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "page not found"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).send(message);
})
app.listen(8080, () => {
    console.log("server is listening ");
})