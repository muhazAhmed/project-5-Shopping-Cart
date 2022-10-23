const mongoose = require("mongoose");

const isValidName = function (value) {
  if (/^[A-Z][a-z]\D*$/.test(value))
    {return true;}
   return false;
};

const isValid = function (value) {

  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
};
const isValidimage= function (value) {
  const ext = [".jpg", ".jpeg", ".bmp", ".gif", ".png", ".svg"]
if((el) => value.endsWith(el))return true
return false
};
const isValidNo = function (value) {
  if (typeof value === "number" ) return true;
  return false;
};

const isValidMobile = function (value) {
  if (typeof value === "string" && /^[6-9]{1}[0-9]{9}$/im.test(value)) return true;
  return false;
};

const isValidpin = function (value) {
  if (/[0-9]\d{5}$/gi.test(value)) return true;
  return false;
};

const isValidEmail = function (value) {
  if (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(value)) return true;
  return false;
};

const isValidPassword = function (value) {
  if ( typeof value === "string" && value.trim().length > 0 && /^[a-zA-Z0-9]{8,15}$/.test(value)) return true;
  return false;
};


const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const isValidObjectId = function (objectId) {
  return mongoose.isValidObjectId(objectId);
};


const isValidString = (String) => {
  return /^[a-zA-Z ]{2,45}$/.test(String)
}
function isValidSize(size) {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(size) !== -1;
}
const isValidPrice = (price) => {
  return /^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price)
}
const isValidNumber = (price) => {
  return /^[0-9]$/.test(price)
}



module.exports = { isValid, isValidRequestBody, isValidObjectId, isValidEmail, isValidPassword,
 isValidName, isValidMobile, isValidpin,isValidimage, isValidString, isValidPrice,isValidNo,isValidSize, isValidNumber};
