import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProjectResponse } from 'src/responses/project.response';
import { ResultResponseDTO } from './result.response.dto';
import { uuid } from 'uuidv4';

export class ProjectResponseDTO implements ProjectResponse {
  @ApiProperty({ example: uuid().toUpperCase() })
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty({ type: ResultResponseDTO, isArray: true })
  @Type(() => ResultResponseDTO)
  results: Array<ResultResponseDTO>;
}
