import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { EntityToResponseDTOMapper } from 'src/mappers/entityToResponse.mapper';
import { VoiceRegisterResponseDTO } from 'src/utils/dtos';
import { VoiceRegisterEntity } from 'src/utils/entities';
import { Class, MaybeArray } from 'src/utils/types';

export class TransformInterceptor<T extends MaybeArray<VoiceRegisterEntity>>
  implements NestInterceptor<T, MaybeArray<VoiceRegisterResponseDTO>>
{
  private mapper: EntityToResponseDTOMapper = new EntityToResponseDTOMapper();

  constructor(private dtoCls?: Class<VoiceRegisterResponseDTO>) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<MaybeArray<VoiceRegisterResponseDTO>> {
    return next.handle().pipe(map((data) => this.mapper.map(data, this.dtoCls)));
  }
}
