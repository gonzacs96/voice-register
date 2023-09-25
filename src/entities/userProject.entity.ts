import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Result } from './result.entity';
import { NotFoundException } from 'src/exceptions/notFound.exception';

@Entity()
export class UserProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'datetime' })
  deletedAt: Date;
  @ManyToOne(() => User, (user) => user.userProjects, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'soft-delete',
  })
  user: User;
  @ManyToOne(() => Project, (project) => project.userProjects, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'soft-delete',
  })
  project: Project;

  public get results(): Array<Result> {
    return this.project.results;
  }

  addResult(result: Result) {
    this.project.addResult(result);
  }

  addResults(results: Array<Result>) {
    results.forEach((result) => this.addResult(result));
  }

  moveResults(resultIds: Array<string>, targetUserProject: UserProject) {
    targetUserProject.addResults(this.findResults(resultIds));
  }

  private findResults(resultIds: Array<string>): Array<Result> {
    const results = this.results.filter(({ id }) => resultIds.includes(id));
    if (results.length !== resultIds.length) throw new NotFoundException();
    return results;
  }
}
