const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

// index route - shows all listings
router.get("/", async(req, res) => {
    const allListings = await Listing.find({}); // fetch every listing from DB
    res.render("listings/index.ejs", { allListings }); // send them to the index page
});

// new route - shows the form to create a new listing
// must come BEFORE "/listings/:id" or express will think "new" is an :id
router.get("/new", async(req, res) => {
    res.render("listings/new.ejs");
})

// show route - shows details of ONE specific listing by its id
router.get("/:id", async(req, res) => {
    let { id } = req.params; // pulls the id value out of the url
    const listing = await Listing.findById(id).populate("reviews"); // find that one listing in DB
    res.render("listings/show.ejs", { listing });
})

// create route - receives form data and saves a new listing to DB
router.post("/", validateListing, wrapAsync(async(req, res, next) => {

    const newListing = new Listing(req.body.listing); // build a new listing using submitted form data

    await newListing.save(); // save it to MongoDB
    res.redirect("/listings"); // go back to the index page to see it


}))


//update
router.put("/:id", validateListing, wrapAsync(async(req, res) => {

    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing });
    res.redirect("/listings");
}));
//delete
router.delete("/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;