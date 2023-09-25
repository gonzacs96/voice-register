import { Injectable } from '@nestjs/common';
import { AddUserToProjectDTO } from 'src/dtos/addUserToProject.dto';
import { CreateUserProjectDTO } from 'src/dtos/createUserProject.dto';
import { Project } from 'src/entities/project.entity';
import { UserProject } from 'src/entities/userProject.entity';
import { NotFoundException } from 'src/exceptions/notFound.exception';
import { TokenPayload } from 'src/types/token-payload.type';
import { EntityManager } from 'typeorm';
import { FilesService } from './files.service';
import { TransactionService } from './transaction.service';
import { UsersService } from './users.service';
import { MoveResultsToProjectDTO } from 'src/dtos/moveResultsToProject.dto';

@Injectable()
export class UserProjectsService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

  async getUserProjects(userDTO: TokenPayload, manager?: EntityManager): Promise<Array<UserProject>> {
    return await this.transactionService.transaction(async (manager) => {
      const { id } = userDTO;
      const user = await this.usersService.findOneById(id, manager);
      return user.userProjects;
    }, manager);
  }

  async getUserProject(id: string, userDTO: TokenPayload, manager?: EntityManager): Promise<UserProject> {
    return await this.transactionService.transaction(async (manager) => {
      const userProject = await manager.findOneBy<UserProject>(UserProject, {
        id,
        user: { id: userDTO.id },
      });
      if (!userProject) throw new NotFoundException();
      return userProject;
    }, manager);
  }

  async createUserProject(
    createUserProjectDTO: CreateUserProjectDTO,
    userDTO: TokenPayload,
    manager?: EntityManager,
  ): Promise<UserProject> {
    return await this.transactionService.transaction(async (manager) => {
      const { name, description } = createUserProjectDTO;
      const user = await this.usersService.findOneById(userDTO.id, manager);
      const project = manager.create<Project>(Project, { name, description, results: [] });
      const userProject = manager.create<UserProject>(UserProject, { user, project });
      return await manager.save(userProject);
    }, manager);
  }

  async deleteUserProject(
    id: string,
    userDTO: TokenPayload,
    manager?: EntityManager,
  ): Promise<UserProject> {
    return await this.transactionService.transaction(async (manager) => {
      const userProject = await this.getUserProject(id, userDTO, manager);
      const { project } = await manager.softRemove<UserProject>(userProject);
      if (project.deletedAt) await this.filesService.deleteFiles(userProject);
      return userProject;
    }, manager);
  }

  async addUserToProject(
    addUserToProjectDTO: AddUserToProjectDTO,
    id: string,
    userDTO: TokenPayload,
    manager?: EntityManager,
  ): Promise<UserProject> {
    return await this.transactionService.transaction(async (manager) => {
      const { userId } = addUserToProjectDTO;
      const userProject = await this.getUserProject(id, userDTO, manager);
      const { project } = userProject;
      const user = await this.usersService.findOneById(userId, manager);
      const newUserProject = manager.create<UserProject>(UserProject, { user, project });
      await manager.save(newUserProject);
      return userProject;
    }, manager);
  }

  async moveResultsToProject(
    moveResultsToProjectDTO: MoveResultsToProjectDTO,
    id: string,
    user: TokenPayload,
    manager?: EntityManager,
  ): Promise<UserProject> {
    return await this.transactionService.transaction(async (manager) => {
      const { targetProjectId, results } = moveResultsToProjectDTO;
      const sourceUserProject = await this.getUserProject(id, user, manager);
      const targetUserProject = await this.getUserProject(targetProjectId, user, manager);
      sourceUserProject.moveResults(results, targetUserProject);
      return await manager.save(targetUserProject);
    }, manager);
  }
}
