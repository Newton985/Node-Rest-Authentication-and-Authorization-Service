import {getCustomRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { UserRepository } from "../repository/UserRepository";
const md5= require("md5");

export class UserController {

    private userRepository = getCustomRepository(UserRepository);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.findOne(request.params.id);
    }

    async oneId(id: string){
        return this.userRepository.findOne(id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        const {password ,email}=request.body;
        let hashedPassword=md5(email+password);
        request.body.password=hashedPassword;
        return this.userRepository.save(request.body);
    }

    async saveOne(user : User){
        return this.userRepository.save(user);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.userRepository.findOne(request.params.id);
        await this.userRepository.remove(userToRemove);
    }

    async findByEmail(request: Request, response: Response){
        return this.userRepository.findByEmail(request.body.email);
    }

    async findByEmailAndPassword(request: Request, response: Response){
        const email=request.body.email;
        const password=request.body.password;
        const hashedPassword=md5(email+password);
    
        return this.userRepository.findByEmailAndPassword(email,hashedPassword);
    }

    async addNewUser(request : Request , response :Response){
        const {password ,email}=request.body;
        let hashedPassword=md5(email+password);
        request.body.password=hashedPassword;
        return this.userRepository.addNew(request);     
    }


}