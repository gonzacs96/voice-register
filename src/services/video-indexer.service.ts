import { Injectable } from '@nestjs/common';
import { ResultsService } from './results.service';
import { TokenPayload } from 'src/types/token-payload.type';
import { AzstorageService } from 'src/services/azstorage.service';
import { QueryUploadFileDto, VersionEnum } from '../dtos/query-upload-file.dto';
import { DataSource } from 'typeorm';
import { AzureVideoIndexerService } from './azureVideoIndexer.service';
import { CreateResultDto } from 'src/dtos/create-result.dto';
import { plainToInstance } from 'class-transformer';
import { ProcessResultDTO } from 'src/dtos/processResult.dto';
import { NotifyQueryDTO } from 'src/dtos/notify.query.dto';
import { UpdateResultDto } from 'src/dtos/update-result.dto';

@Injectable()
export class VideoIndexerService {
  private readonly audioContainer = 'audios';

  constructor(
    private readonly resultsService: ResultsService,
    private readonly azStorageService: AzstorageService,
    private readonly dataSource: DataSource,
    private readonly azureVideoIndexerService: AzureVideoIndexerService,
  ) {}

  async uploadFile(
    { originalname: name, buffer }: Express.Multer.File,
    user: TokenPayload,
    { version, projectId }: QueryUploadFileDto,
  ): Promise<string> {
    return await this.dataSource.transaction(async (manager) => {
      const result = await this.resultsService.create(
        this.createResultDTO(name, projectId, version),
        user,
        manager,
      );
      const { id, audioId } = result;
      const url = await this.azStorageService.uploadAndGetUrl(audioId, buffer, this.audioContainer);
      const { data } = await this.azureVideoIndexerService.uploadVideo(id, version, name, url);
      await this.resultsService.update(id, this.updateResultDto(data), manager);
      return id;
    });
  }

  async getVideoIndexResult({ id: videoId, resultId: id, version }: NotifyQueryDTO) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const { data } = await this.azureVideoIndexerService.getVideoIndex(version, videoId);
        await this.azureVideoIndexerService.deleteVideoSourceFile(version, videoId);
        const result = await this.resultsService.process(this.processResultDTO(id, data), manager);
        await this.azStorageService.upload(result.fileId, this.getBufferFrom(data));
        await this.azStorageService.delete(result.audioId, this.audioContainer);
      });
    } catch (error) {
      await this.resultsService.fail(id);
      throw error;
    }
  }

  private getBufferFrom<T>(data: T): Buffer {
    return Buffer.from(JSON.stringify(data));
  }

  private updateResultDto(data): UpdateResultDto {
    const { id: videoIndexerId } = data;
    return plainToInstance(UpdateResultDto, { videoIndexerId });
  }

  private createResultDTO(name: string, projectId: string, version: VersionEnum): CreateResultDto {
    return plainToInstance(CreateResultDto, { name, projectId, version });
  }

  private processResultDTO(id: string, data): ProcessResultDTO {
    const { id: videoIndexerId, state: status, duration } = data;
    return plainToInstance(ProcessResultDTO, { id, videoIndexerId, status, duration });
  }
}
