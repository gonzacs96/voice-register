import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { HashService } from './hash.service';
import { TransactionService } from './transaction.service';
import { NotFoundException } from 'src/exceptions/notFound.exception';
import { InvalidArgumentException } from 'src/exceptions/invalidArgument.exception';

@Injectable()
export class UsersService {
  constructor(private hashService: HashService, private readonly transactionService: TransactionService) {}

  async findAll(manager?: EntityManager): Promise<User[]> {
    return await this.transactionService.transaction(async (manager) => {
      return await manager.find(User);
    }, manager);
  }

  async findOneById(id: string, manager?: EntityManager): Promise<User> {
    return await this.transactionService.transaction(async (manager) => {
      const user = await manager.findOneBy<User>(User, { id });
      if (!user) throw new NotFoundException();
      return user;
    }, manager);
  }

  async findOneByIdWithResults(id: string, manager?: EntityManager): Promise<User> {
    return await this.transactionService.transaction(async (manager) => {
      return await manager.findOne(User, { where: { id }, relations: ['results'] });
    }, manager);
  }

  async findOneByUsername(username: string, manager?: EntityManager): Promise<User> {
    return await this.transactionService.transaction(async (manager) => {
      return await manager.findOneBy(User, { username });
    }, manager);
  }

  async remove(id: string, manager?: EntityManager): Promise<void> {
    await this.transactionService.transaction(async (manager) => {
      await manager.softDelete(User, id);
    }, manager);
  }

  async create(_user: CreateUserDto, manager?: EntityManager): Promise<User | any> {
    return await this.transactionService.transaction(async (manager) => {
      try {
        const password = await this.hashService.data(_user.password);
        _user.password = password;
        const newUser = manager.create<User>(User, _user);
        return await manager.save(newUser);
      } catch (error) {
        if (/\bViolation of UNIQUE KEY\b/.test(error.message)) {
          throw new InvalidArgumentException(['Account with this email already exists']);
        }
      }
    }, manager);
  }
}
