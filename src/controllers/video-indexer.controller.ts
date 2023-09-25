import {
  Controller,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger/dist/decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { VideoIndexerService } from '../services/video-indexer.service';
import { QueryUploadFileDto } from '../dtos/query-upload-file.dto';
import { NotifyQueryDTO } from 'src/dtos/notify.query.dto';

@Controller('videoindexer')
export class VideoIndexerController {
  constructor(private readonly videoIndexerService: VideoIndexerService) {}

  @ApiQuery({ name: 'id', required: true })
  @ApiQuery({ name: 'resultId', required: true })
  @ApiQuery({ name: 'state', required: true })
  @ApiQuery({ name: 'version', required: true })
  @HttpCode(HttpStatus.OK)
  @Post('/notifyme')
  notifyFromVideoIndexer(@Query() queryParams: NotifyQueryDTO, @Req() req) {
    return this.videoIndexerService.getVideoIndexResult(queryParams);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/uploadvideo')
  @UseInterceptors(FileInterceptor('file'))
  uploadFileToVideoIndexer(
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @Req() req,
    @Query() query: QueryUploadFileDto,
  ) {
    return this.videoIndexerService.uploadFile(file, req.user, query);
  }
}
