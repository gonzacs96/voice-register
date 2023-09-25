import { Injectable, StreamableFile } from '@nestjs/common';
import { TokenPayload } from 'src/types/token-payload.type';
import { EntityManager } from 'typeorm';
import { TransactionService } from './transaction.service';
import { ResultsService } from './results.service';
import { AzstorageService } from './azstorage.service';
import { TranscriptVersion } from 'src/entities/transcriptVersion.entity';
import { NotFoundException } from 'src/exceptions/notFound.exception';
import { TranscriptDTO } from 'src/dtos/createTranscriptVersion.dto';
import { TranscriptLineInsight } from './results.service';
import { plainToInstance } from 'class-transformer';
import { Result } from 'src/entities/result.entity';
import { AlignmentType, Document, Footer, Header, Packer, Paragraph, TextRun } from 'docx';

@Injectable()
export class TranscriptVersionsService {
  private originalId = 0;
  private containerName = 'versions';

  constructor(
    private readonly azstorageService: AzstorageService,
    private readonly transactionService: TransactionService,
    private readonly resultsService: ResultsService,
  ) {}

  async getCurrentTransctiptVersion(
    resultId: string,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<TranscriptVersion> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await this.resultsService.findOne(resultId, manager);
      return await this.currentTranscriptVersionFrom(result);
    }, manager);
  }

  async getOriginalTranscript(
    resultId: string,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<TranscriptVersion> {
    return await this.transactionService.transaction(async (manager) => {
      const transcript = await this.resultsService.findeOneToJson(resultId, manager);
      return plainToInstance(TranscriptVersion, { id: this.originalId, transcript });
    }, manager);
  }

  async getTranscriptVersions(
    resultId: string,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<Array<TranscriptVersion>> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await this.resultsService.findOne(resultId, manager);
      const original = await this.originalTranscriptFrom(result);
      const transcriptVersions = await Promise.all(
        result.transcriptVersions.map(
          async (transcriptVersion) => await this.withTranscript(transcriptVersion),
        ),
      );
      return [original, ...transcriptVersions];
    }, manager);
  }

  async getTranscriptVersion(
    id: number,
    resultId: string,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<TranscriptVersion> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await this.resultsService.findOne(resultId, manager);
      return await this.transcriptVersionFrom(id, result, user, manager);
    }, manager);
  }

  async exportTranscriptVersion(
    id: number,
    resultId: string,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<StreamableFile> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await this.resultsService.findOne(resultId, manager);
      const transcriptVersion = await this.transcriptVersionFrom(id, result, user, manager);
      const paragraphs = transcriptVersion.transcript.flatMap((transcript) =>
        this.paragraphsFrom(transcript),
      );
      const document = this.documentFrom(result, paragraphs);
      const buffer = await Packer.toBuffer(document, true);
      return new StreamableFile(buffer);
    }, manager);
  }

  async backToTranscriptVersion(
    id: number,
    resultId: string,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<TranscriptVersion> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await this.resultsService.findOne(resultId, manager);
      const deletedVersions = result.backToTranscriptVersion(id);
      await manager.softRemove(deletedVersions);
      return await this.currentTranscriptVersionFrom(result);
    }, manager);
  }

  async createTranscriptVersion(
    resultId: string,
    transcript: Array<TranscriptDTO>,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<TranscriptVersion> {
    return await this.transactionService.transaction(async (manager) => {
      const result = await this.resultsService.findOne(resultId, manager);
      const transcriptVersion = manager.create<TranscriptVersion>(TranscriptVersion, {});
      result.addTranscriptVersion(transcriptVersion);
      const savedResult = await manager.save(result);
      const savedTranscriptVersion = savedResult.currentTranscriptVersion;
      await this.azstorageService.upload(
        `${savedTranscriptVersion.versionNumber}`,
        Buffer.from(JSON.stringify(transcript)),
        this.containerName,
      );
      savedTranscriptVersion.transcript = transcript;
      return savedTranscriptVersion;
    }, manager);
  }

  private async currentTranscriptVersionFrom(result: Result) {
    const { currentTranscriptVersion } = result;
    if (currentTranscriptVersion) {
      return await this.withTranscript(currentTranscriptVersion);
    } else {
      return await this.originalTranscriptFrom(result);
    }
  }

  private async withTranscript(transcriptVersion: TranscriptVersion) {
    transcriptVersion.transcript = await this.transcriptFrom(transcriptVersion);
    return transcriptVersion;
  }

  private async originalTranscriptFrom(result: Result): Promise<TranscriptVersion> {
    const transcript = await this.resultsService.transcriptsFrom(result);
    return plainToInstance(TranscriptVersion, { id: this.originalId, transcript });
  }

  private async transcriptFrom(
    transcriptVersion: TranscriptVersion,
  ): Promise<Array<TranscriptLineInsight>> {
    const { versionNumber } = transcriptVersion;
    return JSON.parse((await this.azstorageService.get(`${versionNumber}`, this.containerName)).toString());
  }

  private async transcriptVersionFrom(
    id: number,
    result: Result,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<TranscriptVersion> {
    if (id === this.originalId) return await this.originalTranscriptFrom(result);
    const transcriptVersion = await manager.findOneBy(TranscriptVersion, {
      id,
      result: { id: result.id, project: { userProjects: { user: { id: user.id } } } },
    });
    if (!transcriptVersion) throw new NotFoundException();
    return await this.withTranscript(transcriptVersion);
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
