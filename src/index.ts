import { CodesController } from './controller/CodesController';
import { CodesRepository } from './repository/CodesRepository';
import "reflect-metadata";
import {createConnection, getCustomRepository} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";
import { UserController } from "./controller/UserController";
import { aunthenticate } from './middleware/Aunthenticate';
import { authorize } from './middleware/Authorize';
const md5=require("md5");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
var cors = require('cors')

createConnection().then(async connection => {
    // create express app
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());


   //login router , declared here as it does not need to be aunthenticated
   app.post("/login", (req : Request, res: Response, next :Function)=>{
    const userController=new UserController();

    let accessTokenSecret : string="AVERYLONGSTRINGTHATNOBODYWILLEVERGUESS";

    let refreshTokenSecret : string="ANOTHERVERYLONGSTRINGTHATNOBODYWILLEVERGUESS";
        
    //find user by email -- asserts that user exists
     userController.findByEmail(req,res).then((userE)=>{

        //user not found
        if(userE==null || userE==undefined){ 
            let result={"message":"User Does Not Exist", "status":404};
            res.send(result);
    
         }

         //if user did Not verify Their email address
         else if(!userE.isVerified){

        let result={"message":"Account Not Verified"};

                //create and send a code
        const verificationCode=crypto.randomInt(100000,999999);

        let codesRepository=getCustomRepository(CodesRepository);

        //delete any existing codes for user
        codesRepository.delete({userId:userE.id});

        let code=codesRepository.create();
        
        code.code=verificationCode;
        code.type="verification";
        code.userId=userE.id;

        let nowDate=new Date();
        nowDate.setHours(nowDate.getHours()+5);
        code.expiresAt=nowDate;
        codesRepository.save(code);

        //send email with verification code

            res.send(result);

         }else{


     //find user by combination of email and password
     //asserts that the details are correct
     userController.findByEmailAndPassword(req,res).then((userB)=>{

        if(userB==null || userB==undefined){ //wrong password
            let result={"message":"Incorrect Password", "status":404};
            res.send(result);
    
         }else{


        //user exists and password is correct
        //generate an accessToken
        const {id, fullName, role}=userB;
        const token=jwt.sign({id, fullName, role},accessTokenSecret,{expiresIn:"1d"});

       // const refreshToken=jwt.sign({id, fullName, role},refreshTokenSecret,{expiresIn:"6m"});

        let result={"message":"Login Success", "status":200 , "accessToken":"", "refreshToken":"", "userId":"","role":""};

        result.userId=userB.id;
        result.role=userB.role;
        result.accessToken=token;
        //result.refreshToken=refreshToken;
        result.status=200;
        res.send(result);




         }

     });
    
         }

     });

   });



   //register route --- creates a user and sends email with code
   app.post("/register", (request: Request, response :Response, next: Function)=>{
    let userController=new UserController();


    //check if email exists
    userController.findByEmail(request,response).then((userE)=>{

        //user found
        if(userE!=null || userE!=undefined){ 
            
            //are they verified
        if(!userE.isVerified){
            
            request.body.id=userE.id;
            userController.addNewUser(request,response);
            
            let result={"message":"Email Exists But not verified"};
                            //create and send a code
        const verificationCode=crypto.randomInt(100000,999999);

        let codesRepository=getCustomRepository(CodesRepository);

        //delete any existing codes for user
        codesRepository.delete({userId:userE.id});

        let code=codesRepository.create();
        
        code.code=verificationCode;
        code.type="verification";
        code.userId=userE.id;

        let nowDate=new Date();
        nowDate.setHours(nowDate.getHours()+5);
        code.expiresAt=nowDate;
        codesRepository.save(code);

        //send code email

        response.send(result);

         }else{

            let result={"message":"Account Exists", "status":404};
            response.send(result);
         }

     }else{

        userController.addNewUser(request,response).then((newUser)=> {

            // response.send(newUser);
         
             //create and send a code
             const verificationCode=crypto.randomInt(100000,999999);
         
             let codesRepository=getCustomRepository(CodesRepository);
             let code=codesRepository.create();
             
             code.code=verificationCode;
             code.type="verification";
             code.userId=newUser.id;
         
             let nowDate=new Date();
             nowDate.setHours(nowDate.getHours()+5);
             code.expiresAt=nowDate;
             codesRepository.save(code);
         
             //send email with verification code
             let res={"userdata":newUser,"tokenData":code, "status":"sucess"};
         
             response.send(res);
         
             });
     }




     });

   });
   
   app.post("/verifyEmail",(request: Request, response: Response, next: Function)=>{

    const {verificationCode}=request.body;

    let codeController=new CodesController();

    codeController.findByCode(verificationCode).then((code)=>{

        if(code==null|| code==undefined){

            let result={"message":"Code Not Found","status":"fail"};
             response.send(result);
            
        }else{
          
            let dateNow=new Date();
            let expDate=code.expiresAt;
            const diffTime =dateNow.getTime()-expDate.getTime();

            if(diffTime>0){
                //code expired --delete it
                codeController.remove(code);
                let result={"message":"Code Expired","status":"fail"};


                //create and send new one
            const verificationCode=crypto.randomInt(100000,999999);

            let codesRepository=getCustomRepository(CodesRepository);
            let newCcode=codesRepository.create();
            
            newCcode.code=verificationCode;
            newCcode.type="verification";
            newCcode.userId=code.id;

            let nowDate=new Date();
            nowDate.setHours(nowDate.getHours()+5);
            newCcode.expiresAt=nowDate;
            codesRepository.save(newCcode);

            //send email with verification code

            response.send(result);

            }else{

                //code is okay --verify and login the user
                 let accessTokenSecret : string="AVERYLONGSTRINGTHATNOBODYWILLEVERGUESS";
                 let userController=new UserController();
                  
                userController.oneId(code.userId).then((user)=>{
                    user.isVerified=true;
                userController.saveOne(user);

                codeController.remove(code);  //delete the code 

                    const {id, fullName, role}=user;
                    const token=jwt.sign({id, fullName, role},accessTokenSecret,{expiresIn:"1d"});
            
                   // const refreshToken=jwt.sign({id, fullName, role},refreshTokenSecret,{expiresIn:"6m"});
            
                    let result={"message":"Login Success", "status":"" , "accessToken":"", "refreshToken":"", "userId":"", "role":""};
            
                    result.userId=user.id;
                    result.role=user.role;
                    result.accessToken=token;
                    //result.refreshToken=refreshToken;
                    result.status="sucess";
                    response.send(result);

                });

            }


        }

    });
    

});


//get reset password code
app.post("/resetPasswordCode",(request: Request, response: Response, next: Function)=>{
    const {email}=request.body;

    let userController=new UserController();

    userController.findByEmail(request,response).then((user)=>{

        if(user==undefined || user==null){

            let result={"message":"User Not Found","status":404};
            response.send(result);

        }else{

            //create and send new one
            const resetCode=crypto.randomInt(100000,999999);

            let codesRepository=getCustomRepository(CodesRepository);
            let newCcode=codesRepository.create();
                          
            newCcode.code=resetCode;
            newCcode.type="reset";
            newCcode.userId=user.id;
                
            let nowDate=new Date();
            nowDate.setHours(nowDate.getHours()+5);
            newCcode.expiresAt=nowDate;
            codesRepository.save(newCcode);
                
            //send email with verification code

            let result={"message":"Code Sent to Email","status":200,"code":newCcode.code};
            response.send(result);
        }

    });


});


app.post("/resetPassword",(request: Request, response: Response, next: Function)=>{

    const {resetCode,newPassword}=request.body;

    let codesController=new CodesController();

    codesController.findByCode(resetCode).then((code)=>{

        if(code==null || code==undefined){

            let result={"message":"Code Not Found","status":404};
            response.send(result);

        }else{

            let dateNow=new Date();
            let expDate=code.expiresAt;
            const diffTime =dateNow.getTime()-expDate.getTime();

            if(diffTime>0){
                //code expired --delete it
                codesController.remove(code);
                let result={"message":"Code Expired","status":"fail"};


                //create and send new one
            const verificationCode=crypto.randomInt(100000,999999);

            let codesRepository=getCustomRepository(CodesRepository);
            let newCcode=codesRepository.create();
            
            newCcode.code=verificationCode;
            newCcode.type="reset";
            newCcode.userId=code.id;

            let nowDate=new Date();
            nowDate.setHours(nowDate.getHours()+5);
            newCcode.expiresAt=nowDate;
            codesRepository.save(newCcode);

            //send email with verification code

            response.send(result);

            }else{
                let userController=new UserController();
                userController.oneId(code.userId).then((user)=>{
            
               let hashedPassword=md5(user.email+newPassword); 
               user.password=hashedPassword;
               userController.saveOne(user);

               codesController.remove(code);

               let result={"message":"Password Reset Success","status":200};
               response.send(result);

                });

            }
            

        }

    });


});



    // register express routes from defined application routes
    //all this routes need user to be aunthenticated and authorized to access the resources they request
    //they use middleware Authorization and Aunthentication
    Routes.forEach(route => {
        (app as any)[route.method](route.route,[aunthenticate,authorize(route.access)],(req: Request, res: Response, next: Function) => {

            const result = ( new (route.controller as any))[route.action](req, res, next);

            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });


    // start express server
    app.listen(3000);
    console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results");

}).catch(error => console.log(error));

