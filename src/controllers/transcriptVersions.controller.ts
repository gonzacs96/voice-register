import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TranscriptDTO } from 'src/dtos/createTranscriptVersion.dto';
import { TranscriptVersionResponseDTO } from 'src/dtos/responses/transcriptVersion.response.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { TranscriptVersionsService } from 'src/services/transcriptVersions.service';
import { TokenPayload } from 'src/types/token-payload.type';
import { uuid } from 'uuidv4';

@ApiTags('Transcript versions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('results/:resultId/transcript')
export class TranscriptVersionsController {
  constructor(private readonly transcriptVersionsService: TranscriptVersionsService) {}

  @ApiOperation({ summary: 'Get current transcript version' })
  @ApiResponse({ type: TranscriptVersionResponseDTO, status: 200 })
  @UseInterceptors(new TransformInterceptor(TranscriptVersionResponseDTO))
  @Get('current')
  async getCurrentTranscriptVersion(
    @Param('resultId') resultId: string,
    @Req() req: { user: TokenPayload },
  ) {
    return await this.transcriptVersionsService.getCurrentTransctiptVersion(resultId, req.user);
  }

  @ApiOperation({ summary: 'Get original transcript version' })
  @ApiResponse({ type: TranscriptVersionResponseDTO, status: 200 })
  @UseInterceptors(new TransformInterceptor(TranscriptVersionResponseDTO))
  @Get('original')
  async getOriginalTransctiptVersion(
    @Param('resultId') resultId: string,
    @Req() req: { user: TokenPayload },
  ) {
    return await this.transcriptVersionsService.getOriginalTranscript(resultId, req.user);
  }

  @ApiOperation({ summary: 'Get all transcript versions' })
  @ApiResponse({ type: TranscriptVersionResponseDTO, isArray: true, status: 200 })
  @UseInterceptors(new TransformInterceptor(TranscriptVersionResponseDTO))
  @Get('version')
  async getTranscriptVersions(@Param('resultId') resultId: string, @Req() req: { user: TokenPayload }) {
    return await this.transcriptVersionsService.getTranscriptVersions(resultId, req.user);
  }

  @ApiOperation({ summary: 'Get transcript version' })
  @ApiResponse({ type: TranscriptVersionResponseDTO, status: 200 })
  @UseInterceptors(new TransformInterceptor(TranscriptVersionResponseDTO))
  @Get('version/:version')
  async getTranscriptVersion(
    @Param('version', ParseIntPipe) version: number,
    @Param('resultId') resultId: string,
    @Req() req: { user: TokenPayload },
  ) {
    return await this.transcriptVersionsService.getTranscriptVersion(version, resultId, req.user);
  }

  @ApiOperation({ summary: 'Export transcript version to .docx' })
  @Header('Content-Disposition', `attachment; filename=${uuid()}.docx`)
  @Get('version/:version/docx')
  async exportTranscriptVersion(
    @Param('version', ParseIntPipe) version: number,
    @Param('resultId') resultId: string,
    @Req() req: { user: TokenPayload },
  ) {
    return await this.transcriptVersionsService.exportTranscriptVersion(version, resultId, req.user);
  }

  @ApiOperation({ summary: 'Create current transcript version' })
  @ApiResponse({ type: TranscriptVersionResponseDTO, status: 201 })
  @UseInterceptors(new TransformInterceptor(TranscriptVersionResponseDTO))
  @ApiBody({ type: TranscriptDTO, isArray: true })
  @Post('version')
  async createTranscriptVersion(
    @Param('resultId') resultId: string,
    @Body() transcript: Array<TranscriptDTO>,
    @Req() req: { user: TokenPayload },
  ) {
    return await this.transcriptVersionsService.createTranscriptVersion(resultId, transcript, req.user);
  }

  @ApiOperation({ summary: 'Back to transcript version' })
  @ApiResponse({ type: TranscriptVersionResponseDTO, status: 200 })
  @UseInterceptors(new TransformInterceptor(TranscriptVersionResponseDTO))
  @Patch('version/:version')
  async backToTranscriptVersion(
    @Param('version', ParseIntPipe) version: number,
    @Param('resultId') resultId: string,
    @Req() req: { user: TokenPayload },
  ) {
    return await this.transcriptVersionsService.backToTranscriptVersion(version, resultId, req.user);
  }
}
