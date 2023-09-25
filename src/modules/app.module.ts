import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { AuthModule } from './auth.module';
import { VideoIndexerModule } from './video-indexer.module';
import { ConfigModule } from '@nestjs/config';
import { ResultsModule } from './results.module';
import { AzstorageService } from '../services/azstorage.service';
import { EventsModule } from './events.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceAsyncOptions } from 'src/options/dataSourceAsync.options';
import { UserProjectsModule } from './userProjects.module';
import { DownloadsModule } from './downloads.module';
import { TranscriptVersionsModule } from './transcriptVersions.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(dataSourceAsyncOptions()),
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    UsersModule,
    AuthModule,
    VideoIndexerModule,
    ResultsModule,
    EventsModule,
    UserProjectsModule,
    DownloadsModule,
    TranscriptVersionsModule,
  ],
  controllers: [],
  providers: [AzstorageService],
})
export class AppModule {}
