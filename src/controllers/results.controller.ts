import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  StreamableFile,
  Header,
  UseInterceptors,
} from '@nestjs/common';
import { ResultsService } from '../services/results.service';
import { CreateResultDto } from '../dtos/create-result.dto';
import { UpdateResultDto } from '../dtos/update-result.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger/dist';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { v1 as uuid } from 'uuid';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { ResultResponseDTO } from 'src/dtos/responses/result.response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  create(@Req() req, @Body() createResultDto: CreateResultDto) {
    return this.resultsService.create(createResultDto, req.user);
  }

  @Get()
  findAll(@Req() req) {
    return this.resultsService.findAll(req.user);
  }

  @ApiResponse({ type: ResultResponseDTO, status: 200 })
  @UseInterceptors(new TransformInterceptor(ResultResponseDTO))
  @Get(':id')
  async findOneWithPercentage(@Param('id', ParseUUIDPipe) id: string) {
    return await this.resultsService.findOneWithPercentage(id);
  }

  @Get('export/:id')
  exportOneToJsonById(@Param('id', ParseUUIDPipe) id: string) {
    return this.resultsService.findeOneToJson(id);
  }

  @Get('/export/docx/:id')
  @Header('Content-Disposition', `attachment; filename=${uuid()}.docx`)
  async exportOneToDocById(@Param('id', ParseUUIDPipe) id: string) {
    const doc = await this.resultsService.findOneToDocx(id);
    return new StreamableFile(doc);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateResultDto: UpdateResultDto) {
    return this.resultsService.update(id, updateResultDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resultsService.remove(id);
  }
}
