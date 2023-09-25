import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from 'src/utils/entities';

export const testDataSourceOptions = (): TypeOrmModuleOptions => ({
  type: 'sqlite',
  database: ':memory:',
  entities: entities,
  logging: false,
  synchronize: true,
  dropSchema: true,
});
