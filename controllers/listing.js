const Listing = require("../models/listing")

module.exports.index = async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}
module.exports.showListing = (async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "listing you requested does not exist ");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
})
module.exports.createListing = (async(req, res) => {
    let url = req.file;
    let filename = req.file.filename;
    console.log(url, filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url: url.path, filename: url.filename };
    await newListing.save();
    req.flash("success", "new listing created");

    res.redirect("/listings");
})
module.exports.renderEditForm = (async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing you requested does not exist ");
        return res.redirect("/listings");
    }
    // prepare a resized image url preview for the edit form (if image exists)
    let originalListing = listing.image && listing.image.url ? listing.image.url : null;
    let originalImageUrl = null;
    if (originalListing) {
        originalImageUrl = originalListing.replace("/uploads", "/uploads/w_400,h_400,c_fill");
    }
    console.log(listing);
    res.render("listings/edit.ejs", { listing, originalImageUrl });
})
module.exports.updateListing = (async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file;
        let filename = req.file.filename;
        listing.image = { url: req.file.path, filename: req.file.filename };
        await listing.save();

    }
    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
})
module.exports.destroyListing = (async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", " listing deleted");

    res.redirect("/listings");
})