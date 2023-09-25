import { ResultResponse } from './result.response';

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  results: Array<ResultResponse>;
}
