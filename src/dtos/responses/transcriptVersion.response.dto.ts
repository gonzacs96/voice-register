import { TranscriptVersionResponse } from 'src/responses/transcriptVersion.response';
import { TranscriptResponseDTO } from './transcript.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
export class TranscriptVersionResponseDTO implements TranscriptVersionResponse {
  @ApiProperty()
  version: number;
  @ApiProperty({ type: TranscriptResponseDTO, isArray: true })
  @Type(() => TranscriptResponseDTO)
  transcript: Array<TranscriptResponseDTO>;
}
