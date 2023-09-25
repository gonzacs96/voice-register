import { IsNotEmpty } from 'class-validator';
import { TranscriptLineInsight } from 'src/services/results.service';

export class TranscriptDTO implements TranscriptLineInsight {
  language?: any;
  id: number;
  instances?: any[];
  @IsNotEmpty()
  text?: string;
  confidence: number;
  @IsNotEmpty()
  speakerId: number;
}
