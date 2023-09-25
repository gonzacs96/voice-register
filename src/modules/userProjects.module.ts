import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { UserProjectsService } from 'src/services/userProjects.service';
import { UserProjectsController } from 'src/controllers/userProjects.controller';
import { UserProject } from 'src/entities/userProject.entity';
import { TransactionService } from 'src/services/transaction.service';
import { UsersModule } from './users.module';
import { FilesModule } from './files.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserProject]), UsersModule, FilesModule],
  controllers: [UserProjectsController],
  providers: [UserProjectsService, TransactionService],
  exports: [UserProjectsService],
})
export class UserProjectsModule {}
