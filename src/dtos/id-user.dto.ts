import { IsUUID } from 'class-validator';

export class IdUserDto {
  @IsUUID()
  id: string;
}
