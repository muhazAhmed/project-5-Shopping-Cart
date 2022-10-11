const express = require('express')
const router = express.Router()
const userController= require("../controller/userController")
const{authentication,authorization}=require("../middleware/auth")


router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",authentication,authorization,userController.getUser)
router.put("/user/:userId/profile",authentication,authorization,userController.updateUser)




router.all("/*", (req, res) => 
{ res.status(400).send({ status: false, message: "Endpoint is not correct" }) })

module.exports =router;