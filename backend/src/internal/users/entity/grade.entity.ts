import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./user.entity";

@Entity('sgo_cache_grades')
export class GradeEntity
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'jsonb'})
    data: any;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.sgo_cache_grades)
    @JoinColumn({name: 'user_id'})
    user: UserEntity;

    @Column()
    user_id: string;
}