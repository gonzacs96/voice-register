import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { uuid } from 'uuidv4';

export class MoveResultsToProjectDTO {
  @ApiProperty({ example: uuid().toUpperCase() })
  @IsUUID()
  @IsNotEmpty()
  targetProjectId: string;
  @ApiProperty({ type: 'string', isArray: true, example: [uuid().toUpperCase()] })
  @IsArray()
  @IsNotEmpty()
  results: Array<string>;
}
