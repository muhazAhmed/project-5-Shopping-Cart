const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")

const createCart = async function (req, res) {
    let userId = req.params.userId
    let { productId, quantity } = req.body
    let saveItems = {}
    saveItems.items = []
    const userData = await cartModel.findOne({ userId })
    if (userData) {
        saveItems.userId = userId
        const productData = await productModel.findOne({ _id: productId })
        if (productData) {
            const checkProduct = await cartModel.findOne({ "items.productId": productId }, { items: { $elemMatch: { productId } } })

            if (checkProduct) {
                saveItems.totalPrice = userData.totalPrice + productData.price * quantity
                saveItems.totalItems = userData.totalItems
                saveItems.items.push({ productId: productId, quantity: checkProduct.items[0].quantity + quantity })
            } else {
                saveItems.totalPrice = userData.totalPrice + productData.price * quantity
                saveItems.totalItems = userData.totalItems + 1
                saveItems.items.push({ productId: productId, quantity: quantity })
            }

        }
        console.log(saveItems);
        const savedData = await cartModel.findOneAndUpdate({ _id: userId }, saveItems, { new: true })
        return res.status(201).send({ status: true, data: savedData })
        // totalItems = userData.totalItems
    } else {
        const productData = await productModel.findOne({ _id: productId })
        if (productData) {
            saveItems.totalPrice = productData.price * quantity
            saveItems.totalItems = 1
            saveItems.items = [{ productId: productId, quantity: quantity }]
        }
        saveItems.userId = userId
        const savedData = await cartModel.create(saveItems)
        return res.status(201).send({ status: true, data: savedData })
    }


}

const getCart = async function (req, res) { console.log(saveItems); }
const deleteCart = async function (req, res) { console.log(saveItems); }
const updateCart = async function (req, res) { console.log(saveItems); }

module.exports = { createCart, getCart, updateCart, deleteCart }