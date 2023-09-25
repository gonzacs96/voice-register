import { Module } from '@nestjs/common';
import { DownloadsController } from 'src/controllers/downloads.controller';
import { AzstorageService } from 'src/services/azstorage.service';
import { DownloadsService } from 'src/services/downloads.service';

@Module({
  controllers: [DownloadsController],
  providers: [DownloadsService, AzstorageService],
  imports: [],
  exports: [DownloadsService],
})
export class DownloadsModule {}
