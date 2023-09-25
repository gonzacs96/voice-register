import { testDataSourceOptions } from '../utils/testDataSource.options';

jest.doMock('src/options/dataSourceAsync.options.ts', () => ({ useFactory: testDataSourceOptions }));
