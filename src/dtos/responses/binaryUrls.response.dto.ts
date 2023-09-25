import { ApiProperty } from '@nestjs/swagger';

export class BinaryURLsResponseDTO {
  @ApiProperty()
  windows: string;
}
