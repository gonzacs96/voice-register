import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundException } from 'src/exceptions/notFound.exception';
import { entities } from 'src/utils/entities';
import { DataService } from 'test/utils/data.service';
import { testDataSourceOptions } from 'test/utils/testDataSource.options';
import {
  anotherUserId,
  anotherUserProjects,
  createdUserProject,
  userProject,
  tokenPayload,
  userProjects,
  notFoundId,
  defaults,
} from '../../data/src/services/userProjects.service.spec.data.json';
import { UserProjectsService } from 'src/services/userProjects.service';
import { CreateUserProjectDTO } from 'src/dtos/createUserProject.dto';
import { Project } from 'src/entities/project.entity';
import { DataSource } from 'typeorm';
import { UserProject } from 'src/entities/userProject.entity';
import { AddUserToProjectDTO } from 'src/dtos/addUserToProject.dto';
import { TransactionService } from 'src/services/transaction.service';
import { UsersModule } from 'src/modules/users.module';
import { mock } from 'test/utils/test';

describe('UserProjectsService', () => {
  let module: TestingModule;
  let service: UserProjectsService;
  let dataSource: DataSource;
  const createUserProjectDTO = CreateUserProjectDTO.generator(defaults.createUserProjectDTO);
  const addUserToProjectDTO = AddUserToProjectDTO.generator(defaults.addUserToProjectDTO);
  async function findProject(id: string): Promise<Project> {
    return await dataSource.transaction(async (manager) => {
      return await manager.findOneByOrFail<Project>(Project, { id });
    });
  }
  async function findDeletedUserProject(id: string) {
    return await dataSource.transaction(async (manager) => {
      return await manager.findOneOrFail<UserProject>(UserProject, { withDeleted: true, where: { id } });
    });
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature(entities),
        TypeOrmModule.forRoot(testDataSourceOptions()),
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        UsersModule,
      ],
      providers: [UserProjectsService, TransactionService, DataService],
    })
      .useMocker(mock)
      .compile();
    service = module.get<UserProjectsService>(UserProjectsService);
    dataSource = module.get<DataSource>(DataSource);
    const dataService = module.get<DataService>(DataService);
    await dataService.initialize();
  });

  describe('GetUserProjects', () => {
    it('should return user projects', async () => {
      const returnValue = await service.getUserProjects(tokenPayload);
      expect(returnValue).toMatchObject(userProjects);
    });

    it('should fail if user not exists', async () => {
      await expect(service.getUserProjects({ ...tokenPayload, id: notFoundId })).rejects.toStrictEqual(
        new NotFoundException(),
      );
    });
  });

  describe('GetUserProject', () => {
    it('should return specified user project', async () => {
      const returnValue = await service.getUserProject(userProject.id, tokenPayload);
      expect(returnValue).toMatchObject(userProject);
    });

    it('should fail if user not exists', async () => {
      await expect(
        service.getUserProject(userProject.id, { ...tokenPayload, id: notFoundId }),
      ).rejects.toStrictEqual(new NotFoundException());
    });

    it('should fail if user project not exists', async () => {
      await expect(service.getUserProject(notFoundId, tokenPayload)).rejects.toStrictEqual(
        new NotFoundException(),
      );
    });
  });

  describe('CreateUserProject', () => {
    it('should return created user project', async () => {
      const returnValue = await service.createUserProject(createUserProjectDTO(), tokenPayload);
      expect(returnValue).toMatchObject(createdUserProject);
    });

    it('should create user project', async () => {
      const returnValue = await service.createUserProject(createUserProjectDTO(), tokenPayload);
      const gotUserProject = await service.getUserProject(returnValue.id, tokenPayload);
      expect(returnValue).toMatchObject(gotUserProject);
    });

    it('should create project', async () => {
      const returnValue = await service.createUserProject(createUserProjectDTO(), tokenPayload);
      const gotProject = await findProject(returnValue.project.id);
      expect(gotProject).toMatchObject(createdUserProject.project);
    });

    it('should fail if user not exists', async () => {
      await expect(
        service.createUserProject(createUserProjectDTO(), { ...tokenPayload, id: notFoundId }),
      ).rejects.toStrictEqual(new NotFoundException());
    });
  });

  describe('DeleteUserProject', () => {
    it('should return deleted user project', async () => {
      const returnValue = await service.deleteUserProject(userProject.id, tokenPayload);
      expect(returnValue).toMatchObject(userProject);
    });

    it('should soft delete user project', async () => {
      await service.deleteUserProject(userProject.id, tokenPayload);
      const deletedUserProject = await findDeletedUserProject(userProject.id);
      expect(deletedUserProject.deletedAt).not.toBeNull();
    });

    it('should fail if user not exists', async () => {
      await expect(
        service.deleteUserProject(userProject.id, { ...tokenPayload, id: notFoundId }),
      ).rejects.toStrictEqual(new NotFoundException());
    });

    it('should fail if user project not exists', async () => {
      await expect(service.deleteUserProject(notFoundId, tokenPayload)).rejects.toStrictEqual(
        new NotFoundException(),
      );
    });
  });

  describe('AddUserToProject', () => {
    it('should return user project', async () => {
      const { id } = userProject;
      const returnValue = await service.addUserToProject(addUserToProjectDTO(), id, tokenPayload);
      expect(returnValue).toMatchObject(userProject);
    });

    it('should create new user project', async () => {
      const { id } = userProject;
      await service.addUserToProject(addUserToProjectDTO(), id, tokenPayload);
      const gotUserProjects = await service.getUserProjects({ ...tokenPayload, id: anotherUserId });
      expect(gotUserProjects).toMatchObject(anotherUserProjects);
    });

    it('should fail if user not exists', async () => {
      const { id } = userProject;
      await expect(
        service.addUserToProject(addUserToProjectDTO(), id, { ...tokenPayload, id: notFoundId }),
      ).rejects.toStrictEqual(new NotFoundException());
    });

    it('should fail if new user not exists', async () => {
      const { id } = userProject;
      await expect(
        service.addUserToProject(addUserToProjectDTO({ userId: notFoundId }), id, tokenPayload),
      ).rejects.toStrictEqual(new NotFoundException());
    });

    it('should fail if user project not exists', async () => {
      await expect(
        service.addUserToProject(addUserToProjectDTO(), notFoundId, tokenPayload),
      ).rejects.toStrictEqual(new NotFoundException());
    });
  });

  afterEach(async () => await module.close());
});
