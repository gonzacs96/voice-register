import { Module } from '@nestjs/common';
import { ResultsService } from '../services/results.service';
import { ResultsController } from '../controllers/results.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from '../entities/result.entity';
import { UsersModule } from './users.module';
import { AzstorageService } from 'src/services/azstorage.service';
import { TransactionService } from 'src/services/transaction.service';
import { UserProjectsModule } from './userProjects.module';
import { AzureVideoIndexerService } from 'src/services/azureVideoIndexer.service';
import { VideoIndexerHttpService } from 'src/services/videoIndexerHttp.service';
import { HttpModule } from '@nestjs/axios';
import { FilesModule } from './files.module';

@Module({
  controllers: [ResultsController],
  providers: [
    ResultsService,
    AzstorageService,
    TransactionService,
    AzureVideoIndexerService,
    VideoIndexerHttpService,
  ],
  imports: [TypeOrmModule.forFeature([Result]), UsersModule, UserProjectsModule, HttpModule, FilesModule],
  exports: [ResultsService],
})
export class ResultsModule {}
