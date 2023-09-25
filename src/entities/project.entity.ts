import { Result } from 'src/entities/result.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProject } from './userProject.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'datetime' })
  deletedAt: Date;
  @OneToMany(() => Result, (result) => result.project, { eager: true, cascade: true })
  results: Array<Result>;
  @OneToMany(() => UserProject, (userProject) => userProject.project, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'soft-delete',
  })
  userProjects: Array<UserProject>;

  addResult(result: Result) {
    if (!this.hasResult(result)) this.results.push(result);
    result.setProject(this);
  }

  private hasResult(result: Result): boolean {
    return this.results.some(({ id }) => id === result.id);
  }
}
