const productModel = require("../model/productModel");
const valid = require("../validator/validator");

// ==========================>  getById   <================================

const productByid = async function (req, res) {
  try {
    let productId = req.params.productId;
    if (!valid.isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid ProductId" });

    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product)
      return res.status(404).send({
        status: false,
        message: "No products found or product has been deleted",
      });
    res.status(200).send({ status: true, message: "Success", data: product });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


// ======================>  delete by ID  <================================

const deleteByid = async function (req, res) {
  try {
    let productId = req.params.productId;
    if (!valid.isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid productId" });

    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product)
      return res.status(404).send({
        status: false,
        message: "No products found or product has been deleted",
      });

    let deleteProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      { $set: { isDeleted: true, deletedAt: new Date()}},
      { new: true }
    );
    res
      .status(200)
      .send({ status: true, message: "Success", data: deleteProduct });

  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {productByid,deleteByid }