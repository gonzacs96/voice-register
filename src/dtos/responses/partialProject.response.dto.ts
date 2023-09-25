import { ApiProperty } from '@nestjs/swagger';
import { PartialProjectResponse } from 'src/responses/partialProject.response';
import { uuid } from 'uuidv4';

export class PartialProjectResponseDTO implements PartialProjectResponse {
  @ApiProperty({ example: uuid().toUpperCase() })
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty({ example: new Date() })
  createdAt: string;
  @ApiProperty()
  results: number;
}
