const jwt = require("jsonwebtoken");

const authentication = (req, res, next) => {
    try {
        let token = req.headers["authorization"];
        let btoken=token.split(" ")
       // console.log(a[1])
        if (!token)
            return res.status(401).send({ status: false, msg: "token is required" });
        jwt.verify(btoken[1],"project-pltm", (error, decoded) =>{
           console.log(decoded)
            if (error) {
               let message=(error.message=="jwt expired"?"token is expired,please login again":"token is invalid,not authenticated")
                 return res.status(401).send({ status: false, msg:message });
            } else {
              req.token = decoded;
          //    console.log()
                next(); }
        });
    } catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }
};


const authorization = async (req,res,next)=>{
    try {
        let decodedToken=req.token
        let userid=req.params.userId
        if(!valid.isValidObjectId(userid)){return res.status(400).send({status:false,message:"plz enter valid userId"})}
        if(userid!=decodedToken.userId){
            return res.status(403).send({status:false,message:"you are not authorised"})

        }else{
            next()
        }
    } catch (error) {
        
    }
}
module.exports={authentication,authorization}