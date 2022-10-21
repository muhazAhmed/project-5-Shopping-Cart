const productModel = require("../model/productModel");
const valid = require("../validator/validator");
const {uploadFile}=require("../aws/aws");


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
      if (!valid.isValidString(title))
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
          message: "price required...!",
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

         if(style)
      {if (!valid.isValid(style))
        return res
        .status(400)
        .send({
          status: false,
          message: "Style should be valid an does not contain numbers",
        });
      }
      if(!availableSizes){
        return res.status (400).send({status:false, message:"provide any size"})
      }
      let size1 = ["S", "XS", "M", "X", "L", "XXL","XL"];
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
              "Sizes should be from these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'",
            });
          }
        }
        data.availableSizes=size2
        if(isFreeShipping){
        isFreeShipping = isFreeShipping.toLowerCase()}
        if( files.length>0){
          let validImage=files[0].mimetype.split('/')
          if(validImage[0]!="image"){
          return res.status(400).send({ status: false, message: "Please Provide Valid Image.." })}
          let uploadedFileURL= await uploadFile(files[0])
    
          data.productImage=uploadedFileURL
    }
    else{
      return res.status(400).send({ msg: "No file found" })
    }
    if(installments)
    
    { 
      if (!valid.isValidNumber(installments))
      
        return res
          .status(400)
          .send({
            status: false,
            message: "Installments should be in numbers",
          });}

    
    let saveData = await productModel .create(data)
    
    res.status(200).send({ status: true, data: saveData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
  }

// ==========================>  getByQueryParams  <================================
const getProductByQuery = async (req,res)=> {
  try {

      const {name, size, priceGreaterThan, priceLessThan, priceSort} = req.query;

      const filter = {};

      filter.isDeleted = false;

      if(name){
          filter.title = { $regex: name, $options: 'i' };
      }

      if(size){
        if (!valid.isValidSize(size)) {
          return res.status(400).send({ status: false, message: "Please provide valid size, or please provide in uppercase" });
        }
          //filter.availableSizes = {$regex: size};
          filter.availableSizes=size
      }

      if(priceGreaterThan){
        if (!valid.isValidPrice(priceGreaterThan)) {
          return res.status(400).send({ status: false, message: "Please provide valid price" });
        }
          filter.price = {$gt: priceGreaterThan};
      }

      if(priceLessThan){
        if (!valid.isValidPrice(priceLessThan)) {
          return res.status(400).send({ status: false, message: "Please provide valid price" });
        }
          filter.price = {$lt: priceLessThan};
      }
      if(priceSort){
      if(!priceSort ==1 || !priceSort == -1){
        return res.status(400).send({status : false, message:"priceSort should be either 1 or -1"})
      }}
      let sortAllValue = await productModel.find(filter).sort({ price: priceSort});
      

      if (!sortAllValue.length > 0) {
          return res.status(404).send({ status: false, message: "No Product found" });
      }
    
      res.status(200).send({status: true,message:"Success" ,data: sortAllValue});

  } catch (error) {
      res.status(500).send({ status: false, error: error.message });
  }

}
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

// ======================>  update by ID  <=================================

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

    // if (!(Object.keys(data).length || files))
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "please provide data to update" });

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
      if (!valid.isvalid(title))
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

    if (description ) {
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

    if (isFreeShipping ) {
      isFreeShipping = isFreeShipping.toLowerCase();
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

    if (files && files.length > 0) {
      let validImage=files[0].mimetype.split('/')
      if(validImage[0]!="image"){
     return res.status(400).send({ status: false, message: "Please Provide Valid Image.." })}
      let uploadedFileURL = await uploadFile(files[0]);
      updatedata.productImage = uploadedFileURL;
          
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
       { isDeleted: true, deletedAt: new Date()}
    );
    res
      .status(200)
      .send({ status: true, message: "product success deleted" });

  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {productByid,deleteByid ,createProduct,getProductByQuery, updateProduct}