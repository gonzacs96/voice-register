import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export enum VersionEnum {
  TRIAL = 'trial',
  PAID = 'paid',
}

export class QueryUploadFileDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(VersionEnum)
  public version: VersionEnum;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}
