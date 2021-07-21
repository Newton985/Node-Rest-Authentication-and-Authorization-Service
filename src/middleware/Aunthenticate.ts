import { Response, NextFunction } from 'express';
import { Request } from 'express';
const jwt=require("jsonwebtoken");

export const aunthenticate = (request : Request,response: Response, next: NextFunction)=>{

     let jwtPayLoad;

     const accessTokenSecret="AVERYLONGSTRINGTHATNOBODYWILLEVERGUESS";
     const tokenBearer : string =request.headers.authorization;

     if(tokenBearer!=null && tokenBearer!=undefined){
      
        const token : string =tokenBearer.split(" ")[1];

     try{

         jwtPayLoad=jwt.verify(token, accessTokenSecret);

         let decodedToken=jwt.decode(token,{complete: true});
         let payLoad=decodedToken.payload;

         request.body.user=payLoad;
         next();
         
     }catch(error){
        let result={"message":"","error":""};
        response.status(401);
        result.message="Aunthetication Failure"; 
        result.error=error;
    
        
        response.send(result);
        return;
     }

    }else{
        let result={"message":"","error":"401"};
        response.status(401);
        result.message="Aunthetication Failure";    
        
        response.send(result);
        return;

    }
       
    
}