import { ProjectResponse } from './project.response';

export interface PartialProjectResponse extends Omit<ProjectResponse, 'results'> {
  createdAt: string;
  results: number;
}
