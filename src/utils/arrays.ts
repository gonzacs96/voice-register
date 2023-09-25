import { Class } from './types';

export function sortByDate<T extends { createdAt: Date; updatedAt: Date; deletedAt: Date }>(
  array: Array<T>,
  field: 'createdAt' | 'updatedAt' | 'deletedAt' = 'createdAt',
): Array<T> {
  return array.sort((element1, element2) => element2[field].getTime() - element1[field].getTime());
}

export function isArrayOf<T>(array: Array<any>, cls: Class<T>): array is Array<T> {
  return array[0] instanceof cls;
}
