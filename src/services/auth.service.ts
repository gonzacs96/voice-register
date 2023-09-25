import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Token } from '../types/token.type';
import { HashService } from './hash.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const matched = this.hashService.compare(pass, user.password);
      if (matched) return user;
    }
    return null;
  }

  async login(user: any): Promise<Token> {
    const { id, username } = user;
    return {
      accessToken: await this.jwtService.signAsync({ id, username }),
    };
  }

  async register(dto: CreateUserDto): Promise<Token> {
    const user = await this.usersService.create(dto);
    return await this.login(user);
  }
}
