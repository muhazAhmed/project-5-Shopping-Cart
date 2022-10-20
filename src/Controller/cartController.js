const cartModel = require("../model/cartModel");
const userModel = require("../model/userModel");
const productModel = require("../model/productModel");
const validator = require("../validator/validator")

const createCart = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;
    let { productId, cartId, quantity } = data;

    if (!quantity) {
        quantity = 1;
    }
    if(!validator.isValidRequestBody(req.body))  {
        return res.status(400).send({ status: false, message: "Enter data" })  
    }
    if(typeof quantity != Number && quantity <=0 ){
        return res.status(400).send({ status: false, message: "Enter valid Quantity" })
    }
if(!validator.isValidObjectId(productId)){
    return res.status(400).send({ status: false, message: "Enter valid productId" })

}

    if (cartId) {
        if(!validator.isValidObjectId(cartId)){
            return res.status(400).send({ status: false, message: "Enter valid cartId" })
        
        }
        let findCart = await cartModel.findOne({ _id: cartId });
        if (!findCart) {
            return res.status(404).send({status:false,msg:"cart not found"});
        }
    }
    
    let validProduct = await productModel.findOne({
        _id: productId,
        isDeleted: false,
    });
    if (!validProduct) {
        return res.status(404).send({status:false,msg:"product not found"});
    }
    
   let validCart = await cartModel.findOne( {userId : userId} ).populate("items.productId")
    
    if (validCart) {
        if (cartId) {
            if (validCart._id.toString() != cartId) {
                return res.status(400).send({status:false,msg:"cart is not belong to you"});
            }
        
        let productInCart = validCart.items;
        let updtotal =validCart.totalPrice + validProduct.price * quantity;
        let productid = validProduct._id.toString();
        for (i = 0; i < productInCart.length; i++) {
            let productIdFromItem = productInCart[i].productId._id;
            console.log(productIdFromItem)
            // to update quantity and total price
        if (productid == productIdFromItem) {
            let oldQuantity = productInCart[i].quantity;
          let newQuantity = oldQuantity + quantity;
          productInCart[i].quantity = Number(newQuantity);
          validCart.totalPrice = Number(updtotal);
           validCart.save();
          return res.status(200).send({status:true,data:validCart});
        }
     }
      // to add new product into cart
      validCart.items.push({ productId, quantity });
      let total = validCart.totalPrice + validProduct.price * quantity;
      validCart.totalPrice = total
      validCart.totalItems ++;
       validCart.save();
      return res.status(200).send({status:true,data:validCart});
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
    console.log(result)
    let popcart= await cartModel.findOne({result}).populate("items.productId")

    return res.status(201).send({status:true,msg:"created successfully",data:popcart});
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// ==========================> update Cart <====================================

const updateCart=async (req,res)=>
{
    try {
        let id = req.params.userId
        let {productId,cartId,removeProduct}=req.body
        if(!validator.isValidRequestBody(req.body))  {
            return res.status(400).send({ status: false, message: "Enter data" })  
        }
        if(!validator.isValidObjectId(productId)){
            return res.status(400).send({ status: false, message: "Enter valid productId" })
        }
        if(!validator.isValidObjectId(cartId)){
            return res.status(400).send({ status: false, message: "Enter valid cartId" })  
        }
                //removeProduct validations
        if (removeProduct == 0 || removeProduct == 1);
          else return res.status(400).send({ status: false, message: "please  set to 0 to remove product completely from the cart or set removeProduct to 1 to decrease poduct quantity by 1" })
        let existCart= await cartModel.findById(cartId)
        if(!existCart){
          return  resstatus(404).send({status:false,msg:"no cart found"})
        }
       
      let pd= await productModel.findById(productId)
      if(!pd)(
        res.status(404).send({status:false,msg:"no product found"})
      )
        let l=existCart.items.length
        if(l==0) return res.status(400).send({ status: false, message: "cart is empty nothing to delete" })
       for(let i=0;i<l;i++){
      if(existCart.items[i].productId.toString()==pd._id.toString()){
    
        if(removeProduct==1 && existCart.items[i].quantity>1){
         existCart.items[i].quantity--
        existCart.totalPrice=existCart.totalPrice-(1*pd.price)
        existCart.save();

        }else{
          let up={}
         up.items= existCart.items.filter((x)=>x.productId!=req.body.productId)
         up.totalPrice=existCart.totalPrice-existCart.items[i].quantity*pd.price
         up.totalItems=existCart.totalItems-1
     let removedProduct=await cartModel.findByIdAndUpdate(cartId,up,{new:true})
     return res.status(200).send({status:true,data:removedProduct});
    }
    }}
    return res.status(200).send({status:true,data:existCart});

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });

    }
}
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
        
        let cart = await cartModel.findOne({userId}).populate("items.productId")
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



module.exports = {createCart,updateCart,getCart,deleteCart};
