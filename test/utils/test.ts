import { Class } from 'src/utils/types';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

export function mock<T>(token: Class<T>): T {
  const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
  const Mock = moduleMocker.generateFromMetadata(mockMetadata);
  return new Mock();
}
