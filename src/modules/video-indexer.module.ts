import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { VideoIndexerController } from '../controllers/video-indexer.controller';
import { VideoIndexerService } from '../services/video-indexer.service';
import { ResultsModule } from './results.module';
import { AzstorageService } from '../services/azstorage.service';
import { AzureVideoIndexerService } from 'src/services/azureVideoIndexer.service';
import { VideoIndexerHttpService } from 'src/services/videoIndexerHttp.service';

@Module({
  imports: [HttpModule, ResultsModule],
  providers: [VideoIndexerService, AzstorageService, AzureVideoIndexerService, VideoIndexerHttpService],
  controllers: [VideoIndexerController],
  exports: [VideoIndexerService],
})
export class VideoIndexerModule {}
