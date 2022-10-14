const express=require('express')
const mongoose=require('mongoose')
const route=require('./routes/route.js')
const multer= require("multer");
const app=express();
app.use( multer().any())

app.use(express.json())

mongoose.connect("mongodb+srv://FARINEKHAN:EXtlAhONzagSoJCy@cluster0.wge8afd.mongodb.net/g02?")
.then(()=>console.log("MongoDb is connected"))
.catch(err=>console.log(err))

app.use('/',route)
//connecting port//
app.listen(3000,function(){
    console.log("Express running on port " + ( 3000))
})