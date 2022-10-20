const orderModel = require("../model/orderModel")
const userModel = require("../model/userModel");
const cartModel = require("../model/cartModel");
const valid = require("../validator/validator");

const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId.trim()
        let { cartId, cancellable } = req.body
        if(!valid.isValidRequestBody(req.body))  {
            return res.status(400).send({ status: false, message: "Enter data" })  
        }
        if (!valid.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        if (!valid.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        let userCheck = await userModel.findOne({ _id: userId })
        if (!userCheck) {
            return res.status(404).send({ status: false, message: "user id doesn't exist" })
        }
       
        let cartCheck = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!cartCheck) {
            return res.status(404).send({ status: false, message: "no cart is created for this user " })
        }
        if (cartCheck.items.length == 0) {
            return res.status(400).send({ status: false, message: "cart is empty" })
        }
        let order = {}
        order.userId = userId
        order.items = []
        let itemLength = cartCheck.items.length
        let totalQuantity = 0
        for (let i = 0; i < itemLength; i++) {
            if (cartCheck.items[i].quantity >= 1) {
                order.items.push(cartCheck.items[i])
                totalQuantity += cartCheck.items[i].quantity
            }
        }
        order.totalPrice = cartCheck.totalPrice
        order.totalItems = cartCheck.totalItems
        order.totalQuantity = totalQuantity
        if (cancellable) {
            if (typeof req.body.cancellable != "boolean") {
                return res.status(400).send({ status: false, message: "cancellable should be boolean" })
            }
        }
        order.cancellable = cancellable
     let filter={}
        filter.items=[]
        filter.totalItems=0
        filter.totalPrice=0
        await cartModel .findOneAndUpdate({_id:cartId},filter,{new:true})
        let oredrCreate = await orderModel.create(order)
      let populateorder=await orderModel.findOne({oredrCreate}).populate(items.productId)
        console.log(populateorder)
        res.status(201).send({ status: true, message: "Success", data: populateorder })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let orderId = req.body.orderId
        let statusbody = req.body.status
        if(!valid.isValidRequestBody(req.body))  {
            return res.status(400).send({ status: false, message: "Enter data" })  
        }
        if (!valid.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        let userCheck = await userModel.findOne({ _id: userId })
        if (!userCheck) {
            return res.status(404).send({ status: false, message: "user id doesn't exist" })
        }

        if (!orderId) {
            return res.status(400).send({ status: false, message: "provide orderId" })
        }
        if (!valid.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        let checkOrder = await orderModel.findOne({ _id: orderId })
        if (!checkOrder) {
            return res.status(404).send({ status: false, message: "order is not created " })
        }
        if (checkOrder.userId.toString() !== userId) {
            return res.status(404).send({ status: false, message: `order is not for ${userId}, you cannot order it` })
        }

       if(!statusbody){
        return res.status(400).send({ status: false, message: "status is required" })
     }
        if (!(['completed', 'cancelled'].includes(statusbody))) {
                return res.status(400).send({ status: false, message: `Status must be among ['completed','cancelled'].`, });
            }
        
        if (checkOrder.cancellable == true) {
            if (checkOrder.status == statusbody) {
                return res.status(200).send({ status: false, message: `Order status is alreday ${statusbody}` })
            }

            if (checkOrder.status == "completed") {
                return res.status(400).send({ status: false, message: `Order Completed Successfully.` })
            }

            if (checkOrder.status == "pending") {
                const updateorderStatus = await orderModel.findOneAndUpdate(
                    { _id: checkOrder._id },
                    { $set: { status: statusbody } },
                    { new: true })
                return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updateorderStatus })
            }

            if (checkOrder.status == "cancelled") {
                return res.status(400).send({ status: false, message: `Order is already cancelled.` })
            }
        } else if (checkOrder.cancellable == false) {
            if (statusbody == "completed" && checkOrder.status == "pending") {
                const updateorderStatus = await orderModel.findOneAndUpdate(
                    { _id: checkOrder._id },
                    { $set: { status: statusbody } },
                    { new: true })
                return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updateorderStatus })
            }

        } else {
            return res.status(400).send({ status: false, message: `Cannot cancel the order due to Non-cancellable policy.` })
        }
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
        console.log(error)
    }

}

module.exports = { createOrder, updateOrder }