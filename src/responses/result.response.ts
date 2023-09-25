import { ResultStatus } from 'src/entities/result.entity';

export interface ResultResponse {
  id: string;
  status: ResultStatus;
  videoIndexerId: string;
  name: string;
  duration: string;
  fileId: string;
  percentage: string;
  new: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}
