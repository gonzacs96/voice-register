import { ApiProperty } from '@nestjs/swagger';
import { ResultStatus } from 'src/entities/result.entity';
import { PartialResultResponse } from 'src/responses/partialResult.response';

export class PartialResultResponseDTO implements PartialResultResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  duration: string;
  @ApiProperty({ enum: ResultStatus })
  status: ResultStatus;
}
