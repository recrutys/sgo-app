import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, Not, Repository} from "typeorm";
import {UserEntity} from "./entity/user.entity";
import {ReportService} from "../../external/report/report.service";
import {GradeEntity} from "./entity/grade.entity";

@Injectable()
export class UsersService
{
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(GradeEntity)
        private readonly gradeRepo: Repository<GradeEntity>,
        private readonly reportService: ReportService
    )
    {
    }

    async findBySecretKey(key: string): Promise<UserEntity | null>
    {
        return this.userRepo.findOne({
            where: {
                secret_key: key
            }
        });
    }

    async findByUserId(userId: string): Promise<UserEntity | null>
    {
        return this.userRepo.findOne({
            where: {
                user_id: userId
            }
        });
    }

    async searchUsers(
        query: string,
        currentUserId: string
    ): Promise<Pick<UserEntity, 'user_id' | 'sgo_full_name' | 'sgo_group_name'>[]>
    {
        if (!query || !query.trim())
        {
            return [];
        }

        return await this.userRepo.find({
            where: {
                sgo_full_name: ILike(`%${query.trim()}%`),
                user_id: Not(currentUserId)
            },
            select: {
                user_id: true,
                sgo_full_name: true,
                sgo_group_name: true
            }
        });
    }

    // Синхронизация (кэширование) оценок пользователя в базу
    async syncGradesIfNeeded(user: UserEntity)
    {
        const now = new Date();

        // Проверка: была ли синхронизация более 10 минут назад
        if (user.cache_last_sync_at
            && (now.getTime() - user.cache_last_sync_at.getTime() < 10 * 60 * 1000))
        {
            return;
        }

        try
        {
            // Получаем свежие данные
            const freshData = await this.reportService.getReport(user as any);

            // Сохраняем/обновляем в базе
            let gradeRecord = await this.gradeRepo.findOne({
                where: {
                    user_id: user.user_id
                }
            });

            if (!gradeRecord)
            {
                gradeRecord = this.gradeRepo.create({
                    user_id: user.user_id,
                    data: freshData
                });
            }
            else
            {
                gradeRecord.data = freshData;
            }

            await this.gradeRepo.save(gradeRecord);

            // Обновляем время последней синхронизации у юзера
            user.cache_last_sync_at = now;
            await this.userRepo.save(user);
        }
        catch (e)
        {
            // Пропускаем, если не удалось обновить
        }
    }

    async getCachedGrades(userId: string)
    {
        const grade = await this.gradeRepo.findOne({where: {user_id: userId}});
        return grade ? grade.data : [];
    }
}