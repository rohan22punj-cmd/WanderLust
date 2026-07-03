const express = require("express");
const router = express.Router();


// index - users 
router.get("/", (req, res) => {
    res.send("GET for users");
})

//Show - users 
router.get("/:id", (req, res) => {
    res.send("GET for show users ")
})

//post - users 
router.post("/", (req, res) => {
    res.send("POST for show users ")
})

//delete - users 
router.delete("/:id", (req, res) => {
    res.send("DELETE for show users ")
})

module.exports = router;