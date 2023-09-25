import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateResultDto } from '../dtos/create-result.dto';
import { UpdateResultDto } from '../dtos/update-result.dto';
import { Result, ResultStatus } from '../entities/result.entity';
import { TokenPayload } from 'src/types/token-payload.type';
import { Document, Paragraph, Header, Footer, Packer, TextRun, AlignmentType } from 'docx';
import { AzstorageService } from 'src/services/azstorage.service';
import { TransactionService } from './transaction.service';
import { UserProjectsService } from './userProjects.service';
import { UsersService } from './users.service';
import { ProcessResultDTO } from 'src/dtos/processResult.dto';
import { AzureVideoIndexerService } from './azureVideoIndexer.service';
import { NotFoundException } from 'src/exceptions/notFound.exception';
import { FilesService } from './files.service';

export interface TranscriptLineInsight {
  language?: any;
  id: number;
  instances?: Array<any>;
  text?: string;
  confidence: number;
  speakerId: number;
}

@Injectable()
export class ResultsService {
  constructor(
    private readonly azureVideoIndexerService: AzureVideoIndexerService,
    private readonly azStorageService: AzstorageService,
    private readonly transactionService: TransactionService,
    private readonly userProjectsService: UserProjectsService,
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createResultDto: CreateResultDto,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<Result> {
    return await this.transactionService.transaction(async (manager) => {
      const { projectId } = createResultDto;
      const userProject = await this.userProjectsService.getUserProject(projectId, user, manager);
      const result = manager.create<Result>(Result, { ...createResultDto, transcriptVersions: [] });
      userProject.addResult(result);
      return await manager.save(result);
    }, manager);
  }

  async findAll(userDTO: TokenPayload, manager?: EntityManager): Promise<Result[]> {
    return await this.transactionService.transaction(async (manager) => {
      const { id } = userDTO;
      const user = await this.usersService.findOneById(id, manager);
      return user.results;
    }, manager);
  }

  async findOne(id: string, manager?: EntityManager): Promise<Result> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await manager.findOneBy(Result, { id });
      if (!result) throw new NotFoundException();
      return result;
    }, manager);
  }

  async findOneWithPercentage(id: string, manager?: EntityManager): Promise<Result> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await this.findOne(id, manager);
      const { version, videoIndexerId } = result;
      if (result.status === ResultStatus.PROCESSING) {
        const { data } = await this.azureVideoIndexerService.getVideoIndex(version, videoIndexerId);
        result.percentage = data.videos[0]?.processingProgress ?? '0%';
      }
      return result;
    }, manager);
  }

  async update(id: string, updateResultDto: UpdateResultDto, manager?: EntityManager): Promise<void> {
    await this.transactionService.transaction(async (manager) => {
      await manager.update(Result, id, updateResultDto);
    }, manager);
  }

  async remove(id: string, manager?: EntityManager): Promise<void> {
    await this.transactionService.transaction(async (manager) => {
      const result = await this.findOne(id, manager);
      await manager.softDelete(Result, id);
      await this.filesService.deleteFiles(result);
    }, manager);
  }

  async findeOneToJson(id: string, manager?: EntityManager): Promise<Array<TranscriptLineInsight>> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await this.findOne(id, manager);
      return await this.transcriptsFrom(result);
    }, manager);
  }

  async findOneToDocx(id: string, manager?: EntityManager): Promise<Buffer> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await this.findOne(id, manager);
      const transcripts = await this.transcriptsFrom(result);
      const paragraphs = transcripts.flatMap((transcript) => this.paragraphsFrom(transcript));
      const document = this.documentFrom(result, paragraphs);
      return await Packer.toBuffer(document, true);
    }, manager);
  }

  async fail(id: string, manager?: EntityManager): Promise<void> {
    await this.transactionService.transaction(async (manager) => {
      await manager.update(Result, { id }, { status: ResultStatus.FAILED });
    }, manager);
  }

  async process(processResultDTO: ProcessResultDTO, manager?: EntityManager): Promise<Result> {
    return await this.transactionService.transaction(async (manager) => {
      const { id } = processResultDTO;
      const result = await manager.findOneByOrFail(Result, { id });
      result.process(processResultDTO);
      return await manager.save(Result, result);
    }, manager);
  }

  async transcriptsFrom(result: Result): Promise<Array<TranscriptLineInsight>> {
    const buffer = await this.azStorageService.get(result.fileId);
    const indexResult = JSON.parse(buffer.toString());
    return indexResult.videos[0]?.insights?.transcript ?? [];
  }

  private paragraphsFrom(transcript: TranscriptLineInsight): Array<Paragraph> {
    const textRunOptions = [
      { text: `Speaker: ${transcript.speakerId}`, bold: true, break: 1 },
      { text: `\n${transcript.text}`, font: 'Monospace', break: 1 },
    ];
    return textRunOptions.map(
      (options) => new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun(options)] }),
    );
  }

  private documentFrom(result: Result, paragraphs: Array<Paragraph>): Document {
    return new Document({
      creator: 'Practia Studio - Voz.Register',
      sections: [
        {
          headers: { default: new Header({ children: [new Paragraph(`Transcripción: ${result.name}`)] }) },
          footers: { default: new Footer({ children: [new Paragraph('Practia Studio - Voz.Register')] }) },
          children: paragraphs,
        },
      ],
    });
  }
}
