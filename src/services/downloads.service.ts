import { Injectable } from '@nestjs/common';
import { BinaryURLsResponseDTO } from 'src/dtos/responses/binaryUrls.response.dto';
import { TokenPayload } from 'src/types/token-payload.type';
import { AzstorageService } from './azstorage.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DownloadsService {
  private windowsFile = 'vozregister.exe';
  private binaryContainer = 'binaries';
  constructor(private readonly azStorageService: AzstorageService) {}

  urls(user: TokenPayload): BinaryURLsResponseDTO {
    const windows = this.azStorageService.getSasUrl(this.windowsFile, this.binaryContainer);
    return plainToInstance(BinaryURLsResponseDTO, { windows }, { exposeDefaultValues: true });
  }
}
