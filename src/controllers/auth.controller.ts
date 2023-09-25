import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginUserDto } from '../dtos/login-user.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Request } from 'express';
import { Token } from '../types/token.type';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto): Promise<Token> {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Body() dto: LoginUserDto): Promise<Token> {
    return this.authService.login(req.user);
  }
}
