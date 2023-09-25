import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BinaryURLsResponseDTO } from 'src/dtos/responses/binaryUrls.response.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DownloadsService } from 'src/services/downloads.service';
import { TokenPayload } from 'src/types/token-payload.type';

@ApiTags('Downloads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('download')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @ApiOperation({ summary: 'Get binary urls' })
  @ApiResponse({ type: BinaryURLsResponseDTO, status: 200 })
  @Get('binary/url')
  async urls(@Req() req: { user: TokenPayload }) {
    return this.downloadsService.urls(req.user);
  }
}
