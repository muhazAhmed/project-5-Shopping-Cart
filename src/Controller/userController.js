const userModel = require("../model/userModel")
const valid = require("../validator/validator");
const {uploadFile}=require("../aws/aws")
const bcrypt = require("bcrypt")
const jwt=require("jsonwebtoken")

const createUser = async function (req, res) {
  try  {
    let data = req.body;
    let { fname,lname,email,phone,password,address} = data;
    let files= req.files
    if(files && files.length>0){
        let uploadedFileURL= await uploadFile(files[0])
        data.profileImage=uploadedFileURL
    }
    else{
        return res.status(400).send({ msg: "No file found" })
    }
    
    //                                <<===emptyRequest===>>                                   //
    if (!valid.isValidRequestBody(data)) {
    return res.status(400).send({ status: false, msg: "plz provide data" });
    }

    //--fname--//
    if(!valid.isValid(fname)){return res.status(400).send({ status: false, message: "name is required" })}
    if (!valid.isValidName(fname)) { return res.status(400).send({status: false,
        msg: " first Name's first character must be capital...!",
        });}
        
    //--lname--//
    if(!valid.isValid(lname)){return res.status(400).send({ status: false, message: "name is required" })}
    if (!valid.isValidName(lname)) { return res.status(400).send({status: false,
            msg: " last Name's first character must be capital...!",
            });}
    //--email--//
if(!valid.isValid(email)){return res.status(400).send({ status: false, message: "email is required" })}
if(!valid.isValidEmail(email)){return res.status(400).send({ status: false, message: "emailId is required and must be unique and must be in valid format =>example@gmail.com...!" })}
const dublicateEmail = await userModel.findOne({ email: email });
if (dublicateEmail) { return res.status(400).send({  status: false,
    msg: " Email Already Present", });}
    //--phone--//  
    if(!valid.isValid(phone)){return res.status(400).send({ status: false, message: "phone is required" })}
    if(!valid.isValidMobile(phone)){return res.status(400).send({ status: false, message: " only 10 character " })}
    const dublicatePhone = await userModel.findOne({ phone: phone });
    if (dublicatePhone) {return res.status(400).send({ status: false, msg: "phone must be unique...!",});}
    //--password--//
    if(!valid.isValid(password)){return res.status(400).send({ status: false, message: "password is required" })}
if (!valid.isValidPassword(password)) {return res.status(400).send({status: false,
msg: "Your password must contain at least one alphabet one number minimum 8character maximum 15",
    });
}
const salt = await bcrypt.genSalt(10)
data.password = await bcrypt.hash(data.password, salt)
//--address--//

if (!valid.isValid(address)) {return res.status(400).send({ status: false,
msg: "address required ", });}

if (!valid.isValid(address["shipping"]["street"])) { return res.status(400).send({ status: false, msg: "provid street address" });
}

if (!valid.isValid(address["shipping"]["city"])) { return res .status(400) .send({ status: false, msg: "provid city address" });
}

if (!valid.isValidpin(address.shipping.pincode)) {return res.status(400).send({ status: false, msg: " pincode must have 6 digits only" });
}
if (!valid.isValid(address.billing.street)) { return res.status(400).send({ status: false, msg: "provid street address" });
}

if (!valid.isValid(address.billing.city)) { return res .status(400) .send({ status: false, msg: "provid city address" });
}

if (!valid.isValidpin(address.billing.pincode)) {return res.status(400).send({ status: false, msg: " pincode must have 6 digits only" });
}

let savedData = await userModel.create(data);
res.status(201).send({ status: true, message: "success", data:savedData});
}catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};
//===============================loginuser========================//
const loginUser = async function (req, res) {
    try {
      let data =(req.body);
      let { email, password } = data;
      if (!valid.isValidRequestBody(data)) {
        return res.status(400).send({ status: false, msg: "plz provide data" });
        }
        if(!valid.isValid(email)){return res.status(400).send({ status: false, message: "email is required" })}

        if(!valid.isValid(password)){return res.status(400).send({ status: false, message: "password is required" })}

      let getUser = await userModel.findOne({ email });
      if (!getUser)
        return res
          .status(404)
          .send({ status: false, msg: "User not found or Email Id is invalid" });
  
      let matchPassword = await bcrypt.compare(password, getUser.password);
      if (!matchPassword)
        return res
          .status(401)
          .send({ status: false, msg: "Password is incorrect." });
  
      //To create token
      const token = jwt.sign(
          {
            userId: getUser._id.toString(),
            batch: "Plutonium",
          },
          "project-pltm"
        );
      return res
        .status(200)
        .send({
          status: true,
          message: "Success",
          data: { userId: getUser._id, token: token },
        });
    } catch (err) {
      console.log(err.message);
       res
        .status(500)
        .send({ status: false, message: "Error", error: err.message });
    }
  };

//===========================fetching data==========================================//
const getUser = async function (req,res){
    try{

        let userId = req.params.userId
          
let getUserbyId =await userModel.findById(userId)
    if(getUserbyId){
         return res.status(200).send({status:true,message:"user profile details",data:getUserbyId})}
    else{
            return res.status(404).send({status:true,message:"no such user profile found"})
    }
    }catch(err){
        res.status(500).send({ status: false, message: err.message })
    }
}
//===================================update===================================//
let updateUser = async (req, res) => {
    try {
        let { lname, fname, password, address, phone, email} = req.body
        let UserId = req.params.userId
        let files = req.files
        if (files && files.length > 0) {

            let uploadedFileURL = await uploadFile(files[0])
            req.body.profileImage = uploadedFileURL
        }

        if (!valid.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Provide details to Update" })
        }
        if (fname) {

            if (!valid.isValidName(fname)) {
                return res.status(400).send({ status: false, message: "Provide valid First name" })
            }
        }

        if (lname) {
            if (!valid.isValidName(lname)) {
                return res.status(400).send({ status: false, message: "Provide valid last name" })
            }
        }
        if (email) {
            if (!valid.isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "Provide valid email" })
            }
            let checkemail = await userModel.findOne({ email: email })
            if (checkemail) {
                return res.status(400).send({ status: false, message: "Email already present" })
            }
        }

        if (phone) {
            if (!valid.isValidMobile(phone)) {
                return res.status(400).send({ status: false, message: "Provide valid phone" })
            }
            let checkphone = await userModel.findOne({ phone: phone })
            if (checkphone) {
                return res.status(400).send({ status: false, message: "phone already present" })
            }
        }

        if (password) {
            if (!valid.isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Provide valid password" })
            }
            const salt = await bcrypt.genSalt(10)
           req.body.password = await bcrypt.hash(password, salt)
        }
        if (address) {
           if(address["shipping"]["street"]){
            if (!valid.isValid(address["shipping"]["street"])) { return res.status(400).send({ status: false, msg: "provid street address" });
        }}
        if(address["shipping"]["city"])
        {if (!valid.isValid(address["shipping"]["city"])) { return res .status(400) .send({ status: false, msg: "provid city address" });
        }}
        if(address["shipping"]["pincode"])
       { if (!valid.isValidpin(address.shipping.pincode)) {return res.status(400).send({ status: false, msg: " pincode must have 6 digits only" });
        }}
        if(address["billing"]["street"])
        {if (!valid.isValid(address.billing.street)) { return res.status(400).send({ status: false, msg: "provid street address" });
        }}
        if(address["billing"]["city"])
       { if (!valid.isValid(address.billing.city)) { return res .status(400) .send({ status: false, msg: "provid city address" });
        }}
        if(address["billing"]["pincode"])
       { if (!valid.isValidpin(address.billing.pincode)) {return res.status(400).send({ status: false, msg: " pincode must have 6 digits only" });
        }}
        }
        let updatedData = await userModel.findOneAndUpdate({_id:UserId},req.body,{new:true})
        return res.status(200).send({ status: true, Data : updatedData})

    }
    catch (error) {
        return res.status(500).send({ status: false, msg : error.message})
}
}
module.exports={createUser,updateUser,getUser,loginUser}