if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratergy = require("passport-local");
const User = require("./models/user.js");
const multer = require("multer");

const { cloudinary, storage } = require("./cloudConfig.js");
const upload = multer({ storage });
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

let isConnected = false;

async function main() {
    if (isConnected) return;
    await mongoose.connect(MONGO_URL);
    isConnected = true;
    console.log("connected to DB");
}

// Kick off the first connection attempt eagerly (helps warm starts)
main().catch(err => console.log("DB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// CRITICAL: block every request until the DB connection is confirmed ready.
// This is what actually fixes the buffering timeout on serverless cold starts.
app.use(async(req, res, next) => {
    try {
        await main();
        next();
    } catch (err) {
        next(err);
    }
});

const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET || "mysupersecretcode"
    }
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

store.on("error", (e) => {
    console.log("session store error", e);
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/demouser", async(req, res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student",
    });
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "page not found"));
});

app.use((err, req, res, next) => {
    console.log("FULL ERROR:", err);
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).send(message);
});

// Only bind a port locally / outside Vercel's serverless runtime.
if (process.env.VERCEL !== "1") {
    app.listen(8080, () => {
        console.log("server is listening");
    });
}

module.exports = app;