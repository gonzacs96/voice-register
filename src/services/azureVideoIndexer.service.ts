import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { VersionEnum } from 'src/dtos/query-upload-file.dto';
import { VideoIndexerHttpService } from './videoIndexerHttp.service';
import { firstValueFrom } from 'rxjs';
import { VideoIndexerService } from './video-indexer.service';
import { UnknownException } from 'src/exceptions/unknown.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureVideoIndexerService {
  constructor(
    private readonly videoIndexerHttpService: VideoIndexerHttpService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(VideoIndexerService.name);

  async uploadVideo(
    id: string,
    version: VersionEnum,
    name: string,
    videoUrl: string,
  ): Promise<AxiosResponse> {
    try {
      const httpService = await this.videoIndexerHttpService.getHttpService(version);
      const params = this.uploadVideoParams(id, version, name, videoUrl);
      return await firstValueFrom(httpService.post('Videos', undefined, { params }));
    } catch (error) {
      this.logger.error(error.response.data);
      throw new UnknownException('An error happened with upload file to index');
    }
  }

  async getVideoIndex(version: VersionEnum, videoId: string): Promise<AxiosResponse> {
    try {
      const httpService = await this.videoIndexerHttpService.getHttpService(version);
      return await firstValueFrom(httpService.get<any>(`Videos/${videoId}/Index`));
    } catch (error) {
      this.logger.error(error.response.data);
      throw new UnknownException('An error happened with get video index result');
    }
  }

  async deleteVideoSourceFile(version: VersionEnum.PAID, videoId: string): Promise<AxiosResponse>;
  async deleteVideoSourceFile(version: VersionEnum.TRIAL, videoId: string): Promise<void>;
  async deleteVideoSourceFile(version: VersionEnum, videoId: string): Promise<AxiosResponse | void>;
  async deleteVideoSourceFile(version: VersionEnum, videoId: string): Promise<AxiosResponse | void> {
    if (version === VersionEnum.PAID) {
      try {
        const httpService = await this.videoIndexerHttpService.getHttpService(version);
        return await firstValueFrom(httpService.delete(`Videos/${videoId}/SourceFile`));
      } catch (error) {
        this.logger.error(error.response.data);
        throw new UnknownException('An error happened with delete video source file');
      }
    }
  }

  private uploadVideoParams(id: string, version: VersionEnum, name: string, videoUrl: string) {
    return {
      name,
      videoUrl,
      language: 'es-MX',
      privacy: 'Public',
      priority: `${version === VersionEnum.TRIAL ? '' : 'High'}`,
      indexingPreset: this.configService.get('VI_INDEXING_PRESET'),
      streamingPreset: 'NoStreaming',
      callbackUrl: `${this.configService.get('VI_CALLBACK_URL')}?resultId=${id}&version=${version}`,
    };
  }
}
