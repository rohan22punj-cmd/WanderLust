const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const users = require("./routes/user.js");
const posts = require("./routes/post.js");

app.use(cookieParser());

app.get("/getcookies", (req, res) => {
    res.cookie("greet", "hello");
    res.send("send you some cookies");
});

app.get("/", (req, res) => {
    console.dir(req.cookies);
    res.send("hi i am root");
});

app.use("/users", users);
app.use("/posts", posts);

app.listen(3000, () => {
    console.log("server is listening to 3000");
});