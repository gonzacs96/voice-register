import { Injectable } from '@nestjs/common';
import { Project } from 'src/entities/project.entity';
import { Result } from 'src/entities/result.entity';
import { User } from 'src/entities/user.entity';
import { UserProject } from 'src/entities/userProject.entity';
import { DataSource, DeepPartial } from 'typeorm';
import { users, projects, userProjects, results } from './initial.data.json';

@Injectable()
export class DataService {
  constructor(private readonly dataSource: DataSource) {}

  async initialize() {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(User, users);
      await manager.save(Project, projects);
      await manager.save(UserProject, userProjects);
      await manager.save(Result, results as Array<DeepPartial<Result>>);
    });
  }
}
