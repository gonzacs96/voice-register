import { Module } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UsersController } from '../controllers/users.controller';
import { User } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { HashService } from 'src/services/hash.service';
import { TransactionService } from 'src/services/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, HashService, TransactionService],
  exports: [UsersService],
})
export class UsersModule {}
