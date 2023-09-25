import { IsNotEmpty } from 'class-validator';
import { DeepPartial } from 'src/utils/types';

export class AddUserToProjectDTO {
  @IsNotEmpty()
  userId: string;

  constructor(userId?: string) {
    this.userId = userId;
  }

  static generator(
    defaultAttributes: DeepPartial<AddUserToProjectDTO> = {},
  ): (attributes?: DeepPartial<AddUserToProjectDTO>) => AddUserToProjectDTO {
    return function (attributes: DeepPartial<AddUserToProjectDTO> = {}): AddUserToProjectDTO {
      const { userId } = { ...defaultAttributes, ...attributes };
      return new AddUserToProjectDTO(userId);
    };
  }
}
