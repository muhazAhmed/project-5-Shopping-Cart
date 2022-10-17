const express = require('express')
const router = express.Router()
const userController= require("../controller/userController")
const productController= require("../controller/productController")
<<<<<<< HEAD
const cartController = require ("../Controller/cartController")
=======
const cartController= require("../controller/cartController")
>>>>>>> 2e3c9b7a9c8a9b847db2bf2842e9c0e7d31bef8e
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

<<<<<<< HEAD
// =======================> for cart <========================
router.post("/users/:userId/cart", cartController.createCart)


=======
// ======================> for cart <==================
router.post("/users/:userId/cart",cartController.createCart )
router.get("/users/:userId/cart",cartController.getCart)
router.delete("/users/:userId/cart",cartController.deleteCart )
router.put("/users/:userId/cart",cartController.updateCart )
>>>>>>> 2e3c9b7a9c8a9b847db2bf2842e9c0e7d31bef8e


router.all("/*", (req, res) => 
{ res.status(400).send({ status: false, message: "Endpoint is not correct" }) })

module.exports =router;