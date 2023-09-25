import { ApiProperty } from '@nestjs/swagger';
import { ResultStatus } from 'src/entities/result.entity';
import { ResultResponse } from 'src/responses/result.response';
import { uuid } from 'uuidv4';

export class ResultResponseDTO implements ResultResponse {
  @ApiProperty({ example: uuid().toUpperCase() })
  id: string;
  @ApiProperty({ enum: ResultStatus })
  status: ResultStatus;
  @ApiProperty({ example: '476892a745' })
  videoIndexerId: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: '0:00:00.00' })
  duration: string;
  @ApiProperty({ example: `${uuid().toUpperCase()}.json` })
  fileId: string;
  @ApiProperty({ example: '0%' })
  percentage: string;
  @ApiProperty()
  new: boolean;
  @ApiProperty({ example: new Date() })
  createdAt: string;
  @ApiProperty({ example: new Date() })
  updatedAt: string;
  @ApiProperty({ example: new Date() })
  deletedAt: string;
}
