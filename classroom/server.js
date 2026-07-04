const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const flash = require("connect-flash");
const session = require("express-session");
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const sessionOptions = {
    secret: "my super secret",
    resave: false,
    saveUnitialized: true,
}

app.use(session(sessionOptions));
app.use(flash());


app.get("/registert", (req, res) => {
    let { name = "anonymous" } = req, query;
    req.session.name = name;
    req.flash("success", "user registerd successfully");
})

app.get("/hello", (req, res) => {
    res.render("page.ejs", { name: req.session.name, msg: req.flash("success") });
})

// app.get("/test", (req, res) => {
//     res.send("test successful");
// })

// app.use(cookieParser());

// app.get("/getcookies", (req, res) => {
//     res.cookie("greet", "hello");
//     res.send("send you some cookies");
// });

// app.get("/", (req, res) => {
//     console.dir(req.cookies);
//     res.send("hi i am root");
// });

// app.use("/users", users);
// app.use("/posts", posts);

app.listen(3000, () => {
    console.log("server is listening to 3000");
});