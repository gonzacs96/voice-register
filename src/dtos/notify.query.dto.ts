import { ResultStatus } from 'src/entities/result.entity';
import { VersionEnum } from './query-upload-file.dto';

export class NotifyQueryDTO {
  id: string;
  resultId: string;
  version: VersionEnum;
  state: ResultStatus;
}
