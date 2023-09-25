import { IsNotEmpty } from 'class-validator';
import { DeepPartial } from 'src/utils/types';

export class CreateUserProjectDTO {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;

  constructor(name?: string, description?: string) {
    this.name = name;
    this.description = description;
  }

  static generator(
    defaultAttributes: DeepPartial<CreateUserProjectDTO> = {},
  ): (attributes?: DeepPartial<CreateUserProjectDTO>) => CreateUserProjectDTO {
    return function (attributes: DeepPartial<CreateUserProjectDTO> = {}): CreateUserProjectDTO {
      const { name, description } = { ...defaultAttributes, ...attributes };
      return new CreateUserProjectDTO(name, description);
    };
  }
}
