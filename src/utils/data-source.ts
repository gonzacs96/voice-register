import { DataSource, DataSourceOptions } from 'typeorm';
import { entities } from './entities';
import { updateTableResult1682524579885 } from 'migrations/1682524579885-updateTableResult';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  host: '',
  username: '',
  password: '',
  database: '',
  entities,
  migrations: [updateTableResult1682524579885],
  extra: { trustServerCertificate: true },
  migrationsTableName: '',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
