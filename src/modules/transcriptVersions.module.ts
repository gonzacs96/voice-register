import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranscriptVersionsController } from 'src/controllers/transcriptVersions.controller';
import { TranscriptVersion } from 'src/entities/transcriptVersion.entity';
import { AzstorageService } from 'src/services/azstorage.service';
import { TransactionService } from 'src/services/transaction.service';
import { TranscriptVersionsService } from 'src/services/transcriptVersions.service';
import { ResultsModule } from './results.module';

@Module({
  controllers: [TranscriptVersionsController],
  providers: [AzstorageService, TransactionService, TranscriptVersionsService],
  imports: [TypeOrmModule.forFeature([TranscriptVersion]), ResultsModule],
  exports: [TranscriptVersionsService],
})
export class TranscriptVersionsModule {}
