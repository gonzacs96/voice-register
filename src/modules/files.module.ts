import { Module } from '@nestjs/common';
import { AzstorageService } from 'src/services/azstorage.service';
import { FilesService } from 'src/services/files.service';

@Module({ providers: [AzstorageService, FilesService], exports: [FilesService] })
export class FilesModule {}
