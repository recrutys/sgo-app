import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import {UsersModule} from "../../internal/users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [ExamsController],
  providers: [ExamsService],
})
export class ExamsModule {}
