import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Result } from './result.entity';
import { TranscriptLineInsight } from 'src/services/results.service';

@Entity()
export class TranscriptVersion {
  @PrimaryColumn({ generated: 'increment' })
  id: number;
  @ManyToOne(() => Result, (result) => result.transcriptVersions, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'soft-delete',
  })
  result: Result;
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'datetime' })
  deletedAt: Date;

  transcript: Array<TranscriptLineInsight>;

  public get versionNumber(): number {
    return this.id;
  }
}
