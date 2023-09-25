import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { VersionEnum } from 'src/dtos/query-upload-file.dto';
import { TranscriptVersion } from './transcriptVersion.entity';

export interface ProcessResultArgs {
  videoIndexerId: string;
  status: ResultStatus;
  duration: string;
}

export enum ResultStatus {
  PROCESSING = 'Processing',
  PROCESSED = 'Processed',
  FAILED = 'Failed',
}

@Entity()
export class Result {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ enum: ResultStatus, default: ResultStatus.PROCESSING })
  status: ResultStatus;
  @Index()
  @Column({ nullable: true })
  videoIndexerId: string;
  @Column({ nullable: false })
  name: string;
  @Column()
  version: VersionEnum;
  @Column({ default: null, nullable: true })
  duration: string;
  @Column({ default: null, nullable: true })
  fileId: string;
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'datetime' })
  deletedAt: Date;
  @ManyToOne(() => Project, (project) => project.results, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'soft-delete',
  })
  project: Project;
  @OneToMany(() => TranscriptVersion, (transcript) => transcript.result, { cascade: true, eager: true })
  transcriptVersions: Array<TranscriptVersion>;

  private readonly maxTranscriptVersions: number = 1;

  public get currentTranscriptVersion() {
    return this.transcriptVersions.reduce(
      (previous, current) => (current.versionNumber > previous.versionNumber ? current : previous),
      this.transcriptVersions[0],
    );
  }

  private _percentage: string;
  public get percentage(): string {
    return this.status === ResultStatus.PROCESSING ? this._percentage : '100%';
  }
  public set percentage(percentage: string) {
    this._percentage = this.status === ResultStatus.PROCESSING ? percentage : '100%';
  }

  public get audioId(): string {
    return `${this.id}-${this.name}`;
  }

  setProject(project: Project) {
    this.project = project;
  }

  process({ videoIndexerId, status, duration }: ProcessResultArgs) {
    this.fileId = `${this.id}.json`;
    this.videoIndexerId = videoIndexerId;
    this.status = status;
    this.duration = duration;
  }

  backToTranscriptVersion(versionNumber: number) {
    const deletedTranscriptVersions = this.transcriptVersions.filter(
      (transcriptVersion) => transcriptVersion.versionNumber > versionNumber,
    );
    this.transcriptVersions = this.transcriptVersions.filter(
      (transcriptVersion) => transcriptVersion.versionNumber <= versionNumber,
    );
    return deletedTranscriptVersions;
  }

  addTranscriptVersion(transcriptVersion: TranscriptVersion) {
    if (this.transcriptVersions.length === this.maxTranscriptVersions) this.deleteFirstTranscriptVersion();
    this.transcriptVersions.push(transcriptVersion);
  }

  private deleteFirstTranscriptVersion() {
    const firstTranscriptVersion = this.transcriptVersions.reduce(
      (previous, current) => (current.versionNumber < previous.versionNumber ? current : previous),
      this.transcriptVersions[0],
    );
    this.transcriptVersions = this.transcriptVersions.filter(({ id }) => id !== firstTranscriptVersion.id);
  }
}
