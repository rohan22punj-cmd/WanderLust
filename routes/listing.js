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
        return next(new ExpressError(400, errMsg));
    }
    next();
};
router.get("/", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    console.log("listings found:", allListings.length);
    console.log("first listing:", JSON.stringify(allListings[0]));
    res.render("listings/index.ejs", { allListings });
}));

router.get("/", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

router.get("/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "listing you requested does not exist ");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

router.get("/:id/edit", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing you requested does not exist ");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

router.post("/", validateListing, wrapAsync(async(req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.image = { url: req.body.listing.image, filename: "default" };
    await newListing.save();
    req.flash("success", "new listing created");

    res.redirect("/listings");
}));

router.put("/:id", validateListing, wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing });
    req.flash("success", "listing updated");

    res.redirect("/listings");
}));

router.delete("/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", " listing deleted");

    res.redirect("/listings");
}));

module.exports = router;