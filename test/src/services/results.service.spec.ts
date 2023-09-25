import { Test, TestingModule } from '@nestjs/testing';
import { ResultsService } from 'src/services/results.service';
import {
  notFoundId,
  results,
  plainResult,
  defaults,
  tokenPayload,
} from '../../data/src/services/results.service.spec.data.json';
import { CreateResultDto } from 'src/dtos/create-result.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDataSourceOptions } from 'test/utils/testDataSource.options';
import { ConfigModule } from '@nestjs/config';
import { DataService } from 'test/utils/data.service';
import { DeepPartial } from 'typeorm';
import { entities } from 'src/utils/entities';
import { NotFoundException } from 'src/exceptions/notFound.exception';
import { UsersModule } from 'src/modules/users.module';
import { UserProjectsModule } from 'src/modules/userProjects.module';
import { TransactionService } from 'src/services/transaction.service';
import { mock } from 'test/utils/test';
import { AzstorageService } from 'src/services/azstorage.service';

describe('ResultsService', () => {
  let module: TestingModule;
  let service: ResultsService;
  const createResultDto = CreateResultDto.generator(
    defaults.createResultDto as DeepPartial<CreateResultDto>,
  );

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature(entities),
        TypeOrmModule.forRoot(testDataSourceOptions()),
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        UsersModule,
        UserProjectsModule,
      ],
      providers: [ResultsService, TransactionService, DataService],
    })
      .overrideProvider(AzstorageService)
      .useValue(mock(AzstorageService))
      .useMocker(mock)
      .compile();
    service = module.get<ResultsService>(ResultsService);
    const dataService = module.get<DataService>(DataService);
    await dataService.initialize();
  });

  describe('Create', () => {
    it('should return result', async () => {
      const returnValue = await service.create(createResultDto(), tokenPayload);
      expect(returnValue).toMatchObject(plainResult);
    });

    it('should create result', async () => {
      const returnValue = await service.create(createResultDto(), tokenPayload);
      const gotResult = await service.findOne(returnValue.id);
      expect(returnValue).toMatchObject(gotResult);
    });

    it('should fail if user not exists', async () => {
      await expect(
        service.create(createResultDto(), { ...tokenPayload, id: notFoundId }),
      ).rejects.toStrictEqual(new NotFoundException());
    });

    it('should fail if user project not exists', async () => {
      await expect(
        service.create(createResultDto({ projectId: notFoundId }), tokenPayload),
      ).rejects.toStrictEqual(new NotFoundException());
    });
  });

  describe('FindAll', () => {
    it('should return user results', async () => {
      const returnValue = await service.findAll(tokenPayload);
      expect(returnValue).toMatchObject(results);
    });

    it('should fail if user not exists', async () => {
      await expect(service.findAll({ ...tokenPayload, id: notFoundId })).rejects.toStrictEqual(
        new NotFoundException(),
      );
    });
  });

  afterEach(async () => await module.close());
});
