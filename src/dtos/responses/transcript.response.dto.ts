import { ApiProperty } from '@nestjs/swagger';
import { TranscriptResponse } from 'src/responses/transcript.response';

export class TranscriptResponseDTO implements TranscriptResponse {
  @ApiProperty()
  language?: any;
  @ApiProperty()
  id: number;
  @ApiProperty()
  instances?: any[];
  @ApiProperty()
  text?: string;
  @ApiProperty()
  confidence: number;
  @ApiProperty()
  speakerId: number;
}
