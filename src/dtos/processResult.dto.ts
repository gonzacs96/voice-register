import { ResultStatus } from 'src/entities/result.entity';

export class ProcessResultDTO {
  id: string;
  videoIndexerId: string;
  status: ResultStatus;
  duration: string;
}
