import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {GradeEntity} from "./grade.entity";

@Entity('sgo_users')
export class UserEntity
{
    @PrimaryGeneratedColumn('uuid')
    user_id: string;

    @Column({
        unique: true
    })
    login: string;

    @Column()
    password_hash: string;

    // Сессия на сайте (не СГО)
    @Column({
        unique: true
    })
    secret_key: string;

    @Column({
        type: 'timestamp'
    })
    secret_key_expires_at: Date;

    // Данные сетевого города
    @Column()
    sgo_full_name: string;

    @Column()
    sgo_group_name: string;

    @Column({
        type: 'text'
    })
    sgo_session: string;

    @Column()
    sgo_student_id: string;

    // Для вебхука телеграм
    @Column({
        nullable: true,
        type: 'varchar'
    })
    tg_chat_id: string | null;

    // Время последней синхронизации: для кэширования оценок
    @Column({
        type: 'timestamp',
        nullable: true
    })
    cache_last_sync_at: Date | null;

    @OneToMany(() => GradeEntity, (grade) => grade.user)
    sgo_cache_grades: GradeEntity[];
}