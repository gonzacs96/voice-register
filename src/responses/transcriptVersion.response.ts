import { TranscriptResponse } from './transcript.response';

export interface TranscriptVersionResponse {
  version: number;
  transcript: Array<TranscriptResponse>;
}
