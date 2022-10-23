const express=require('express')
const mongoose=require('mongoose')
const route=require('./routes/route.js')
const multer= require("multer");
const app=express();
app.use( multer().any())

app.use(express.json())

mongoose.connect("mongodb+srv://muhaz:6VE8Lk82R6vAuBok@cluster0.syf7fzi.mongodb.net/shoppingCart")
.then(()=>console.log("MongoDb is connected"))
.catch(err=>console.log(err))

app.use('/',route)
//connecting port//
app.listen(3000,function(){
    console.log("Express running on port " + ( 3000))
})