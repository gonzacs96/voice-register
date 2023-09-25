import { ResultStatus } from 'src/entities/result.entity';

export interface PartialResultResponse {
  id: string;
  name: string;
  duration: string;
  status: ResultStatus;
}
