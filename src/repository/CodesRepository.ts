import { Code } from './../entity/Code';
import { EntityRepository, Repository } from "typeorm";



@EntityRepository(Code)
export class CodesRepository extends Repository<Code>{

    findByCode(code :number){
        return this.findOne({code:code});
    }
    
}