import { Request } from 'express';
import { getCustomRepository } from 'typeorm';
import { CodesRepository } from '../repository/CodesRepository';
import { Code } from './../entity/Code';
export class CodesController{


    private codesRepository=getCustomRepository(CodesRepository);

    async save(code: Code){
        return  this.codesRepository.save(code);
    }

    async one(request : Request){
        return this.codesRepository.findOne(request.body.id);
    }

    async remove(code : Code){
        await this.codesRepository.remove(code);
    }

    async findByCode(code: number){
        return this.codesRepository.findByCode(code);
    }
}