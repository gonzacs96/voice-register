import { Injectable } from '@nestjs/common/decorators';
import { plainToInstance } from 'class-transformer';
import { Mapper } from './mapper';
import { UserProject } from 'src/entities/userProject.entity';
import { Result } from 'src/entities/result.entity';
import { UnknownException } from 'src/exceptions/unknown.exception';
import { Class, MaybeArray } from 'src/utils/types';
import { VoiceRegisterResponseDTO } from 'src/utils/dtos';
import { VoiceRegisterEntity } from 'src/utils/entities';
import { PartialProjectResponseDTO } from 'src/dtos/responses/partialProject.response.dto';
import { ProjectResponseDTO } from 'src/dtos/responses/project.response.dto';
import { PartialResultResponseDTO } from 'src/dtos/responses/partialResult.response.dto';
import { ResultResponseDTO } from 'src/dtos/responses/result.response.dto';
import { TranscriptVersion } from 'src/entities/transcriptVersion.entity';
import { TranscriptVersionResponseDTO } from 'src/dtos/responses/transcriptVersion.response.dto';
import { SortEntityMapper } from './sortEntity.mapper';

@Injectable()
export class EntityToResponseDTOMapper extends Mapper<
  MaybeArray<VoiceRegisterEntity>,
  VoiceRegisterResponseDTO
> {
  private sorter: SortEntityMapper = new SortEntityMapper();

  map<T extends VoiceRegisterEntity, R extends VoiceRegisterResponseDTO>(source: T, dtoCls?: Class<R>): R;
  map<T extends VoiceRegisterEntity, R extends VoiceRegisterResponseDTO>(
    source: Array<T>,
    dtoCls?: Class<R>,
  ): Array<R>;
  map(
    source: Array<VoiceRegisterEntity>,
    dtoCls?: Class<VoiceRegisterResponseDTO>,
  ): Array<VoiceRegisterResponseDTO>;
  map(source: VoiceRegisterEntity, dtoCls?: Class<VoiceRegisterResponseDTO>): VoiceRegisterResponseDTO;
  map(
    source: MaybeArray<VoiceRegisterEntity>,
    dtoCls?: Class<VoiceRegisterResponseDTO>,
  ): MaybeArray<VoiceRegisterResponseDTO> {
    if (source instanceof Array) return this.mapArray(source, dtoCls);
    if (source instanceof UserProject) return this.userProjectResponseDTO(source, dtoCls);
    if (source instanceof Result) return this.resultResponseDTO(source, dtoCls);
    if (source instanceof TranscriptVersion) return this.transcriptVersionResponseDTO(source, dtoCls);
    throw new UnknownException();
  }

  private mapArray<T extends VoiceRegisterEntity, R extends VoiceRegisterResponseDTO>(
    source: Array<T>,
    dtoCls?: Class<R>,
  ): Array<R> {
    return this.sorter.sort(source, dtoCls).map((source) => this.map(source, dtoCls));
  }

  private transcriptVersionResponseDTO(
    source: TranscriptVersion,
    dtoCls?: Class<VoiceRegisterResponseDTO>,
  ): TranscriptVersionResponseDTO {
    const { versionNumber: version, transcript } = source;
    return this.plainToInstance(TranscriptVersionResponseDTO, { version, transcript });
  }

  private userProjectResponseDTO(
    source: UserProject,
    dtoCls?: Class<ProjectResponseDTO>,
  ): ProjectResponseDTO;
  private userProjectResponseDTO(
    source: UserProject,
    dtoCls?: Class<PartialProjectResponseDTO>,
  ): PartialProjectResponseDTO;
  private userProjectResponseDTO(
    source: UserProject,
    dtoCls?: Class<VoiceRegisterResponseDTO>,
  ): PartialProjectResponseDTO;
  private userProjectResponseDTO(source: UserProject, dtoCls?: Class<VoiceRegisterResponseDTO>) {
    const {
      id,
      project: { name, description, results, createdAt },
    } = source;
    if (dtoCls?.name === PartialProjectResponseDTO.name) {
      return this.plainToInstance(PartialProjectResponseDTO, {
        id,
        name,
        description,
        createdAt,
        results: results.length,
      });
    } else {
      return this.plainToInstance(ProjectResponseDTO, {
        id,
        name,
        description,
        results: this.map(results, ResultResponseDTO),
      });
    }
  }

  private resultResponseDTO(source: Result, dtoCls?: Class<VoiceRegisterResponseDTO>) {
    const {
      id,
      name,
      duration,
      status,
      fileId,
      videoIndexerId,
      createdAt,
      updatedAt,
      deletedAt,
      percentage,
    } = source;
    if (dtoCls?.name === ResultResponseDTO.name) {
      return this.plainToInstance(ResultResponseDTO, {
        id,
        status,
        videoIndexerId,
        name,
        duration,
        fileId,
        percentage,
        new: this.resultStatus(source),
        createdAt,
        updatedAt,
        deletedAt,
      });
    } else {
      return this.plainToInstance(PartialResultResponseDTO, { id, name, duration, status });
    }
  }

  private resultStatus({ createdAt }: Result): boolean {
    return new Date().getTime() - createdAt.getTime() <= 3600000;
  }

  private plainToInstance<T, V>(cls: Class<T>, plain: V): T;
  private plainToInstance<T, V>(cls: Class<T>, plain: V[]): T[];
  private plainToInstance<T, V>(cls: Class<T>, plain: V | V[]): T | T[] {
    return plainToInstance(cls, plain, { exposeDefaultValues: true });
  }
}
