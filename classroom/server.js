const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");

app.get("/", (req, res) => {
    res.send("hi i am root ");
})

app.use("/users", users);
app.use("/posts", users);

app.listen(3000, () => {
    console.log("server is listening to 3000");
})