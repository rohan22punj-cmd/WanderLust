const express = require("express");
const router = express.Router();



//POST
// index 
router.get("/", (req, res) => {
    res.send("GET for users");
})

//Show 
router.get("/:id", (req, res) => {
    res.send("GET for show users ")
})

//post 
router.post("/", (req, res) => {
    res.send("POST for show users ")
})

//delete
router.delete("/:id", (req, res) => {
    res.send("DELETE for show users ")
})

module.exports = router;