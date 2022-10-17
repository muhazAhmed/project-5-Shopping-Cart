const express = require('express')
const router = express.Router()
const userController= require("../controller/userController")
const productController= require("../controller/productController")
const cartController = require ("../Controller/cartController")
const{authentication,authorization}=require("../middleware/auth")


router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",authentication,authorization,userController.getUser)
router.put("/user/:userId/profile",authentication,authorization,userController.updateUser)

// ======================> for product <==================
router.post("/products",productController.createProduct )
router.get("/products",productController.getProductByQuery )
router.get("/products/:productId",productController.productByid )
router.delete("/products/:productId",productController.deleteByid )
router.put("/products/:productId",productController.updateProduct )

// =======================> for cart <========================
router.post("/users/:userId/cart", cartController.createCart)
router.get("/users/:userId/cart", cartController.getCart)
router.delete("/users/:userId/cart", cartController.deleteCart)




router.all("/*", (req, res) => 
{ res.status(400).send({ status: false, message: "Endpoint is not correct" }) })

module.exports =router;