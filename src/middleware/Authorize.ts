import { NextFunction } from 'express';
import { Response } from 'express';
import { Request } from 'express';


export const authorize=(role : string)=>{
  return function(request: Request, response :Response, next: NextFunction){
    let user=request.body.user;

    if(role=='all'|| role==user.role){

      next();

    }else{
        let result={"message":"", "status":0};
        response.status(401);
        
        result.status=401;
        result.message="Access Denied";
        response.send(result);

    }

   }
}