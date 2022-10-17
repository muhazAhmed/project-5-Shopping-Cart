const cartModel = require("../model/cartModel");
const userModel = require("../model/userModel");
const productModel = require("../model/productModel");
const { count } = require("../model/productModel");
const validator = require("../validator/validator")

const createCart = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;
    let { productId, cartId, quantity } = data;

    if (!quantity) {
        quantity = 1;
    }
    
    let validUser = await userModel.findOne({ _id: userId });
    if (!validUser) {
        return res.send("user not found");
    }
    
    if (cartId) {
        let findCart = await cartModel.findOne({ _id: cartId });
        if (!findCart) {
            return res.send("cart not found");
        }
    }
    
    let validProduct = await productModel.findOne({
        _id: productId,
        isDeleted: false,
    });
    console.log(validProduct);
    if (!validProduct) {
        return res.send("no product found");
    }
    
    validCart = await cartModel.findOne( {userId : userId} );
    
    if (validCart) {
        // console.log(object);
        if (cartId) {
            if (validCart._id.toString() != cartId) {
                return res.send("cart is not belong to u");
            }
        
        let productInCart = validCart.items;
        let updtotal =
        validCart.totalPrice + validProduct.price * quantity;
        let productid = validProduct._id.toString();
        for (i = 0; i < productInCart.length; i++) {
            let productIdFromItem = productInCart[i].productId.toString();
            
            // to update quantity and total price
        if (productid == productIdFromItem) {
            let oldQuantity = productInCart[i].quantity;
          let newQuantity = oldQuantity + quantity;
          productInCart[i].quantity = Number(newQuantity);
          validCart.totalPrice = Number(updtotal);
          await validCart.save();
          return res.send(validCart);
        }
      }
      // to add new product into cart
      validCart.items.push({ productId, quantity });
      let total = validCart.totalPrice + validProduct.price * quantity;
      validCart.totalPrice = Number(total)
      validCart.totalItems ++;
      console.log(validCart);
      await validCart.save();
      return res.send(validCart);
    }
}
    // for new cart
    let newPrice = validProduct.price * quantity;
    let obj = {
        userId: userId,
        items: [
            {
                productId: productId,
                quantity: quantity,
            },
        ],
      totalPrice: newPrice,
    };
    obj["totalItems"] = obj.items.length;
    let result = await cartModel.create(obj);
    return res.send(result);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// ==========================> Get Cart <====================================
const getCart = async (req,res) =>{
    try {
        let userId = req.params.userId
        if(!validator.isValid){
            return res.status(400).send({status : false, message : "provide userId"})
        }
        let user = await userModel.findOne({_id : userId})
        if(!user){
            return res.status(404).send({ status : false, message : "user not found"})
        }
        
        let cart = await cartModel.findOne({userId})
        if(!cart){
            return res.status(404).send({ status : false, message : "cart not found"})
        }
        return res.status(200).send({status : true, message : "Success", data : cart})
        
    } catch (error) {
        return res.status(500).send({ status : false, message : error.message})
        
    }
}
// ==========================> Delete Cart <====================================
const deleteCart = async function (req, res) { 
    try {
        const userId = req.params.userId;
        if (!validator.isValid(userId))
            return res
                .status(400)
                .send({ status: false, message: "User Id is Not Valid" });

        let userData = await userModel.findOne({
            _id: userId,
            isDeleted: false,
        });
        if (!userData) {
            return res.status(404).send({ status: false, msg: "No User Found" });
        }

        let userCart = await cartModel.findOne({ userId})
        if(!userCart){
            return res
                .status(400)
                .send({ status: false, message: "no such cart for this user" });
        }

        let deleteCart = await cartModel.findOneAndUpdate({ userId:userId }, { items: [], totalPrice: 0, totalItems: 0}, {new: true})

        return res.status(200).send({ status: true, message: "Cart Deleted Successfully", data: deleteCart })
    } catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }
 }


module.exports = {createCart,getCart,deleteCart};
