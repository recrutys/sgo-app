import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from 'typeorm';

@Entity('sgo_tg_tokens')
export class TelegramTokenEntity
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        unique: true
    })
    token: string;

    @Column()
    chat_id: string;

    @Column({
        nullable: true
    })
    user_id: string;

    @Column({
        type: 'timestamp'
    })
    expires_at: Date;

    @CreateDateColumn()
    created_at: Date;
}