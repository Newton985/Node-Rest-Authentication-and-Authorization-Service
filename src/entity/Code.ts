import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Code{

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column()
    type: string;

    @Column()
    code: number;

    @Column()
    userId: string;

    @Column()
    expiresAt: Date;
}