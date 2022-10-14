const productModel = require("../model/productModel");
const valid = require("../validator/validator");
const {uploadFile}=require("../aws/aws");
const { Query } = require("mongoose");


const titleRegex = /^[a-zA-Z ]{2,45}$/;


const createProduct = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;

   //                                <<===emptyRequest===>>                                   //
   if (!valid.isValidRequestBody(data)) {
    return res.status(400).send({ status: false, msg: "plz provide data" });
    }


    let {
      title,
      description,
      price,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = data;

    
      if (!valid.isValid(title))
        return res
          .status(400)
          .send({ status: false, message: "Title is required." });
      if (!titleRegex.test(title))
        return res
          .status(400)
          .send({
            status: false,
            message: " Please provide valid title including characters only.",
          });

      let checkTitle = await productModel.findOne({ title: data.title });
      if (checkTitle)
        return res
          .status(400)
          .send({ status: false, message: "Title already exist" });
  
 
      if (!valid.isValid(description))
        return res.status(400)
          .send({ status: false, message: "description is required." });

          
      if (!(price))
      return res
        .status(400)
        .send({
          status: false,
          message: "price Should be in number only...!",
        });
      if (! valid.isValidPrice(price))
        return res
          .status(400)
          .send({
            status: false,
            message: "price Should be in number only...!",
          });
   data.currencyId="INR"
   data.currencyFormat="₹"


      if (!valid.isValid(style))
        return res
          .status(400)
          .send({
            status: false,
            message: "Style should be valid an does not contain numbers",
          });
      
    
      if (!valid.isValidNo(installments))
        return res
          .status(400)
          .send({
            status: false,
            message: "Installments should be in numbers",
          });

      let size1 = ["S", "XS", "M", "X", "L", "XXL", "XL"];
      let size2 = availableSizes
        .toUpperCase()
        .split(",")
        .map((x) => x.trim());
      for (let i = 0; i < size2.length; i++) {
        if (!size1.includes(size2[i])) {
          return res.status(400)
            .send({
              status: false,
              message:
                "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'",
            });
          }
        }
        data.availableSizes=size2
      isFreeShipping = isFreeShipping.toLowerCase();
      if(files && files.length>0){
        let uploadedFileURL= await uploadFile(files[0])
        data.productImage=uploadedFileURL
    }
    else{
        return res.status(400).send({ msg: "No file found" })
    }
      
    let saveData = await productModel .create(data)
    
    res.status(200).send({ status: true, data: saveData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
  }

// ==========================>  getByQueryParams  <================================

const getProductByQuery = async function (req, res) {
  try {
    let query = req.query
    let {priceGreaterThan, priceLessThan} = query


    if (query.size) {
        let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        let size2 = query.size.split(",").map((x) => x.trim().toUpperCase())
        for (let i = 0; i < size2.length; i++) {
            if (!(sizes.includes(size2[i]))) {
                return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })
            }
        }
        query.availableSizes = { $in: size2 }
    }

    if (query.name) {
      if (!valid.isValid(query.name)) return res.status(400).send({ status: false, message: "name should be in string & not empty" })
      query.title = { $regex: query.name, $options: 'i' }
    }
    let greate = {}
    let less = {}
    let gOl = {}
    if(priceGreaterThan && priceLessThan){
      if (!valid.isValidNo(priceGreaterThan))  return res.status(400).send({ status: false, message: "priceGreaterThan should be in valid number/decimal format" })
      if (!valid.isValidNo(priceLessThan))  return res.status(400).send({ status: false, message: "priceLessThan should be in valid number/decimal format" })
      gOl["price"] = {$gte: parseInt(priceGreaterThan), $lte: parseInt(priceLessThan)}
    }
    console.log(gOl);
  
    if (query.priceLessThan) {
        less['price'] = { $lt: parseInt(query['priceLessThan']) }
    }
    console.log(less);
    if (query.priceGreaterThan) {
      greate['price'] = { $gt: parseInt(query['priceGreaterThan']) }
    }
    console.log(greate);

    let allProducts = await productModel.find({ $and: [query, { isDeleted: false }, less, greate,gOl] }).sort({ "price": query['priceSort'] }).select({__v:0})
    if (allProducts.length == 0) return res.status(404).send({ status: false, message: "no such Product" })

    res.status(200).send({ status: true, message: "Success", data: allProducts })
}
catch (error) {
    console.log(error)
    res.status(500).send({ status: false, message: error.message })
}}

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

const updateProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    let data = req.body;
    let files = req.files;

    if (!productId)
      return res
        .status(400)
        .send({ status: false, message: "provide productId" });

    if (!valid.isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "invalid productId" });

    let checkId = await productModel.findById({ _id: productId });
    if (!checkId)
      return res
        .status(404)
        .send({ status: false, message: "no such product" });

    if (checkId.isDeleted == true)
      return res
        .status(404)
        .send({ status: false, message: "product is already deleted" });

    if (!(Object.keys(data).length || files))
      return res
        .status(400)
        .send({ status: false, message: "please provide data to update" });

    let {
      title,
      description,
      price,
      isFreeShipping,
      currencyId,
      currencyFormat,
      style,
      availableSizes,
      installments,
    } = data;

    let updatedata = {};

    if (title) {
      if (!valid.isValid(title))
        return res
          .status(400)
          .send({ status: false, message: "Title is required." });
      if (!titleRegex.test(title))
        return res
          .status(400)
          .send({
            status: false,
            message: " Please provide valid title including characters only.",
          });

      let checkTitle = await productModel.findOne({ title: data.title });
      if (checkTitle)
        return res
          .status(400)
          .send({ status: false, message: "Title already exist" });
      updatedata.title = title;
    }

    if (description || typeof description == "string") {
      if (!valid.isValid(description))
        return res
          .status(400)
          .send({ status: false, message: "description is required." });
      updatedata.description = description;
    }

    if (price) {
      if (!valid.isValidPrice(price))
        return res
          .status(400)
          .send({
            status: false,
            message: "price Should be in number only...!",
          });
      updatedata.price = price;
    }

    // if (currencyId || typeof currencyId == "string") {
    //   if (!/INR/.test(currencyId))
    //     return res
    //       .status(400)
    //       .send({
    //         status: false,
    //         message:
    //           "Currency Id of product should be in uppercase 'INR' format",
    //       });
    //   updatedata.currencyId = currencyId;
    // }

    // if (currencyFormat || typeof currencyFormat == "string") {
    //   if (!/₹/.test(currencyFormat))
    //     return res
    //       .status(400)
    //       .send({
    //         status: false,
    //         message: "Currency format/symbol of product should be in '₹' ",
    //       });
    //   updatedata.currencyFormat = currencyFormat;
    // }

    if (style) {
      if (!valid.isValidString(style))
        return res
          .status(400)
          .send({
            status: false,
            message: "Style should be valid an does not contain numbers",
          });
      updatedata.style = style;
    }

    if (installments) {
      if (!valid.isValidNo(installments))
        return res
          .status(400)
          .send({ status: false, message: "Installments should be valid" });

      updatedata.installments = installments;
    }

    if (availableSizes) {
      let size1 = ["S", "XS", "M", "X", "L", "XXL", "XL"];
      let size2 = availableSizes
        .toUpperCase()
        .split(",")
        .map((x) => x.trim());
      for (let i = 0; i < size2.length; i++) {
        if (!size1.includes(size2[i])) {
          return res
            .status(400)
            .send({
              status: false,
              message:
                "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'",
            });
        }
        updatedata.availableSizes = size2;
      }
    }

    if (isFreeShipping || isFreeShipping == "") {
      isFreeShipping = isFreeShipping.toLowerCase();
      if (isFreeShipping == "true" || isFreeShipping == "false") {
        isFreeShipping = JSON.parse(isFreeShipping);
      } else {
        return res
          .status(400)
          .send({
            status: false,
            message: "Enter a valid value for isFreeShipping",
          });
      }
      if (typeof isFreeShipping != "boolean") {
        return res
          .status(400)
          .send({
            status: false,
            message: "isFreeShipping must be a boolean value",
          });
      }
      updatedata.isFreeShipping = isFreeShipping;
    }

    if (files == [])
      return res
        .status(400)
        .send({ status: false, message: "provide image in files" });

    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0]);
      updatedata.productImage = uploadedFileURL;
      if (!/(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i.test(updatedata.productImage))
        return res
          .status(400)
          .send({
            status: false,
            message:
              "Please provide profileImage in correct format like jpeg,png,jpg,gif,bmp etc",
          });
    }

    let updateData = await productModel
      .findOneAndUpdate(
        {
          _id: productId,
        },
        updatedata,
        { new: true }
      )
      .select({ __v: 0 });
    res
      .status(200)
      .send({ status: true, message: "product updated", data: updateData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
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

module.exports = {productByid,deleteByid ,createProduct,getProductByQuery, updateProduct}