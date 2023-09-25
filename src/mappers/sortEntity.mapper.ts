import { Injectable } from '@nestjs/common';
import { PartialProjectResponseDTO } from 'src/dtos/responses/partialProject.response.dto';
import { ResultResponseDTO } from 'src/dtos/responses/result.response.dto';
import { Result } from 'src/entities/result.entity';
import { UserProject } from 'src/entities/userProject.entity';
import { isArrayOf, sortByDate } from 'src/utils/arrays';
import { VoiceRegisterResponseDTO } from 'src/utils/dtos';
import { VoiceRegisterEntity } from 'src/utils/entities';
import { Class } from 'src/utils/types';
import { Mapper } from './mapper';

@Injectable()
export class SortEntityMapper extends Mapper<Array<VoiceRegisterEntity>, Array<VoiceRegisterEntity>> {
  sort<T extends VoiceRegisterEntity, R extends VoiceRegisterResponseDTO>(
    source: Array<T>,
    dtoCls?: Class<R>,
  ): Array<T> {
    return this.map(source, dtoCls);
  }

  map<T extends VoiceRegisterEntity, R extends VoiceRegisterResponseDTO>(
    source: Array<T>,
    dtoCls?: Class<R>,
  ): Array<T>;
  map<T extends VoiceRegisterEntity, R extends VoiceRegisterResponseDTO>(
    source: Array<T>,
    dtoCls?: Class<R>,
  ) {
    if (isArrayOf(source, UserProject)) return this.sortUserProjects(source, dtoCls);
    if (isArrayOf(source, Result)) return this.sortResults(source, dtoCls);
    return source;
  }

  private sortUserProjects(
    source: Array<UserProject>,
    dtoCls?: Class<VoiceRegisterResponseDTO>,
  ): Array<UserProject> {
    if (dtoCls?.name === PartialProjectResponseDTO.name) return sortByDate(source);
    return source;
  }

  private sortResults(source: Array<Result>, dtoCls?: Class<VoiceRegisterResponseDTO>): Array<Result> {
    if (dtoCls?.name === ResultResponseDTO.name) return sortByDate(source);
    return source;
  }
}
