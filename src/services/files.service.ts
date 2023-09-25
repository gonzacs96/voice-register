import { Injectable } from '@nestjs/common';
import { Result } from 'src/entities/result.entity';
import { TranscriptVersion } from 'src/entities/transcriptVersion.entity';
import { UserProject } from 'src/entities/userProject.entity';
import { VoiceRegisterEntity } from 'src/utils/entities';
import { AzstorageService } from './azstorage.service';

@Injectable()
export class FilesService {
  private versionsContainer = 'versions';

  constructor(private readonly azStorageService: AzstorageService) {}

  async deleteFiles(entity: VoiceRegisterEntity) {
    if (entity instanceof Array) await this.deleteArrayFiles(entity);
    if (entity instanceof UserProject) await this.deleteUserProjectFiles(entity);
    if (entity instanceof Result) await this.deleteResultFiles(entity);
    if (entity instanceof TranscriptVersion) await this.deleteTranscriptVersionFiles(entity);
  }

  private async deleteArrayFiles(entities: Array<VoiceRegisterEntity>) {
    for (const entity of entities) await this.deleteFiles(entity);
  }

  private async deleteUserProjectFiles(userProject: UserProject) {
    for (const result of userProject.results) await this.deleteFiles(result);
  }

  private async deleteResultFiles(result: Result) {
    await this.azStorageService.delete(result.fileId);
    for (const transcriptVersion of result.transcriptVersions) await this.deleteFiles(transcriptVersion);
  }

  private async deleteTranscriptVersionFiles(transcriptVersion: TranscriptVersion) {
    await this.azStorageService.delete(`${transcriptVersion.versionNumber}`, this.versionsContainer);
  }
}
