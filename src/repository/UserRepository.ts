import { Request } from 'express';
import { User } from './../entity/User';
import { EntityRepository, Repository } from "typeorm";


@EntityRepository(User)
export class UserRepository extends Repository<User>{
    findByEmail(email: string){
        return this.findOne({email:email});
    }

    findByEmailAndPassword(email: string, hashedPassword: string){
        return this.findOne({email:email, password:hashedPassword});
    }

    addNew(request: Request){
        return this.save(request.body);
    }
}