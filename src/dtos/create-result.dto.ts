import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ResultStatus } from '../entities/result.entity';
import { DeepPartial } from 'src/utils/types';
import { VersionEnum } from './query-upload-file.dto';

export class CreateResultDto {
  @IsUUID()
  id?: string;

  @IsEnum(ResultStatus)
  status?: ResultStatus;

  videoIndexerId?: string;

  name: string;

  duration: string;

  @IsUUID()
  fileId?: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsEnum(VersionEnum)
  @IsNotEmpty()
  version: VersionEnum;

  constructor(
    id?: string,
    status?: ResultStatus,
    videoIndexerId?: string,
    name?: string,
    duration?: string,
    fileId?: string,
    projectId?: string,
    version?: VersionEnum,
  ) {
    this.id = id;
    this.status = status;
    this.videoIndexerId = videoIndexerId;
    this.name = name;
    this.duration = duration;
    this.fileId = fileId;
    this.projectId = projectId;
    this.version = version;
  }

  static generator(
    defaultAttributes: DeepPartial<CreateResultDto> = {},
  ): (attributes?: DeepPartial<CreateResultDto>) => CreateResultDto {
    return function (attributes: DeepPartial<CreateResultDto> = {}): CreateResultDto {
      const { id, status, videoIndexerId, name, duration, fileId, projectId, version } = {
        ...defaultAttributes,
        ...attributes,
      };
      return new CreateResultDto(id, status, videoIndexerId, name, duration, fileId, projectId, version);
    };
  }
}
