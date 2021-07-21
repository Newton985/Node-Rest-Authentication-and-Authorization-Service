import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
    UpdateDateColumn, DeleteDateColumn, OneToMany} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    fullName: string;

    @Column({unique:true})
    email: string;

    @Column()
    username: string;

    @Column()
    password: string;
    
    @Column()
    phoneNumber: string;

    @Column()
    role: string;

    @Column()
    isVerified: boolean=false;
    
    @CreateDateColumn()
    dateCreated: Date;

    @UpdateDateColumn()
    dateUpdated: Date;

    @DeleteDateColumn()
    dateDeleted: Date;
  

}
